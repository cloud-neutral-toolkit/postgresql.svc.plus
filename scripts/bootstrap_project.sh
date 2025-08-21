#!/usr/bin/env bash
# scripts/bootstrap_project.sh
# Initialize or reconcile a GitHub Projects v2 board for a USER account.
# Requires: gh >= 2.50, jq, awk, sed
set -euo pipefail

CFG="${1:-.github/project.yml}"

if ! command -v gh >/dev/null; then
  echo "Please install GitHub CLI: https://cli.github.com/" >&2
  exit 1
fi
if ! command -v jq >/dev/null; then
  echo "Please install jq (brew install jq / apt-get install jq)" >&2
  exit 1
fi

# ====== REPO CONTEXT ======
OWNER="svc-design"   # GitHub USER (not org)
REPO="XControl"      # target repo for issues

# ====== Read minimal config from YAML ======
if [ ! -f "$CFG" ]; then
  echo "Config not found: $CFG" >&2
  exit 1
fi

TITLE=$(awk -F': *' '/^title:/ {sub(/^"/,"",$2); sub(/"$/,"",$2); print $2; exit}' "$CFG")
DESC=$(awk -F': *' '/^short_description:/ {sub(/^"/,"",$2); sub(/"$/,"",$2); print $2; exit}' "$CFG")
[ -z "${TITLE:-}" ] && { echo "title missing in $CFG"; exit 1; }

echo "Ensuring project: '$TITLE' under user '$OWNER' ..."

# ====== Find or create project (USER space) ======
PID=$(gh api graphql -f query='
  query($owner:String!, $q:String!){
    user(login:$owner){
      projectsV2(first:50, query:$q){ nodes{ id title } }
    }
  }' -F owner="$OWNER" -F q="$TITLE" \
  | jq -r --arg t "$TITLE" '.data.user.projectsV2.nodes[]? | select(.title==$t) | .id' || true)

if [ -z "${PID:-}" ]; then
  echo "Creating project (Projects v2 in USER space)..."
  PID=$(gh project create --owner "$OWNER" --title "$TITLE" --format json | jq -r '.id')
else
  echo "Project exists. ID: $PID"
fi

# ----- Set description via GraphQL (gh project edit expects number; use node id instead) -----
if [ -n "${DESC:-}" ]; then
  gh api graphql -f query='
    mutation($pid:ID!, $desc:String!){
      updateProjectV2(input:{projectId:$pid, shortDescription:$desc}){ projectV2{ id } }
    }' -F pid="$PID" -F desc="$DESC" >/dev/null || true
fi
echo "Project ID: $PID"

# ====== Fields: normalize Status; ensure Milestone & Priority ======
# Use CLI to list fields to avoid GraphQL union pitfalls
field_id_by_name () { # name -> id or ""
  gh project field-list "$PID" --format json | jq -r --arg n "$1" '.[] | select(.name==$n) | .id'
}

echo "Normalizing Status field options (Todo / In Progress / Done) ..."
STATUS_FIELD_ID=$(field_id_by_name "Status")
if [ -z "$STATUS_FIELD_ID" ]; then
  # Projects v2 默认自带 Status；极少数情况下不存在时创建
  STATUS_FIELD_ID=$(gh project field-create "$PID" --name "Status" --data-type SINGLE_SELECT --format json | jq -r '.id')
fi

# helper: ensure an option exists on a single-select field
ensure_option_on_field () { # fieldId, optionName
  local fid="$1" oname="$2"
  local oid
  oid=$(gh api -X POST graphql -f query='
    query($pid:ID!, $fid:ID!) {
      node(id:$pid){
        ... on ProjectV2 {
          field(id:$fid){
            ... on ProjectV2SingleSelectField { options { id name } }
          }
        }
      }
    }' -F pid="$PID" -F fid="$fid" \
    | jq -r --arg n "$oname" '.data.node.field.options[]? | select(.name==$n) | .id')
  if [ -z "$oid" ] || [ "$oid" = "null" ]; then
    gh api -X POST graphql -f query='
      mutation($pid:ID!, $fid:ID!, $name:String!){
        updateProjectV2SingleSelectField(input:{
          projectId:$pid, fieldId:$fid, options:[{name:$name}]
        }){ projectV2 { id } }
      }' -F pid="$PID" -F fid="$fid" -F name="$oname" >/dev/null
  fi
}

for s in "Todo" "In Progress" "Done"; do
  ensure_option_on_field "$STATUS_FIELD_ID" "$s"
done

echo "Ensuring custom fields Milestone & Priority ..."
MILESTONE_FID=$(field_id_by_name "Milestone")
if [ -z "$MILESTONE_FID" ]; then
  MILESTONE_FID=$(gh project field-create "$PID" --name "Milestone" --data-type SINGLE_SELECT --format json | jq -r '.id')
fi
PRIORITY_FID=$(field_id_by_name "Priority")
if [ -z "$PRIORITY_FID" ]; then
  PRIORITY_FID=$(gh project field-create "$PID" --name "Priority" --data-type SINGLE_SELECT --format json | jq -r '.id')
fi

for opt in MVP Stability; do ensure_option_on_field "$MILESTONE_FID" "$opt"; done
for opt in P0 P1 P2; do ensure_option_on_field "$PRIORITY_FID" "$opt"; done

# ====== Views: Kanban + two tables ======
echo "Ensuring views (Kanban, MVP (Table), Stability (Table)) ..."
create_view() { # name, layout=BOARD|TABLE
  local name="$1" layout="$2"
  local exists
  exists=$(gh api graphql -f query='
    query($pid:ID!){
      node(id:$pid){ ... on ProjectV2 { views(first:50){ nodes{ id name } } } }
    }' -F pid="$PID" | jq -r --arg n "$name" '.data.node.views.nodes[]? | select(.name==$n) | .id')
  if [ -z "$exists" ]; then
    gh api graphql -f query='
      mutation($pid:ID!, $name:String!, $layout:ProjectV2ViewLayout!){
        createProjectV2View(input:{projectId:$pid, name:$name, layout:$layout}){ projectView{ id } }
      }' -F pid="$PID" -F name="$name" -F layout="$layout" >/dev/null || true
  fi
}
create_view "Kanban" "BOARD"
create_view "MVP (Table)" "TABLE"
create_view "Stability (Table)" "TABLE"

# ====== Helpers to set field values ======
# get option id by name for a field
opt_id () { # fieldId, optionName
  gh api -X POST graphql -f query='
    query($pid:ID!, $fid:ID!) {
      node(id:$pid){
        ... on ProjectV2 {
          field(id:$fid){
            ... on ProjectV2SingleSelectField { options { id name } }
          }
        }
      }
    }' -F pid="$PID" -F fid="$1" \
    | jq -r --arg n "$2" '.data.node.field.options[]? | select(.name==$n) | .id'
}

set_single_select() { # itemId, fieldId, optionName
  local item="$1" fid="$2" oname="$3"
  local oid; oid=$(opt_id "$fid" "$oname")
  [ -z "$oid" ] && { echo "Option '$oname' not found on field $fid"; return 1; }
  gh api -X POST graphql -f query='
    mutation($pid:ID!, $iid:ID!, $fid:ID!, $oid:String!) {
      updateProjectV2ItemFieldValue(input:{
        projectId:$pid, itemId:$iid, fieldId:$fid,
        value:{ singleSelectOptionId:$oid }
      }){ projectV2Item { id } }
    }' -F pid="$PID" -F iid="$item" -F fid="$fid" -F oid="$oid" >/dev/null
}

set_status() { # itemId, "Todo|In Progress|Done"
  set_single_select "$1" "$STATUS_FIELD_ID" "$2"
}

# ====== Add items from YAML (create issues if missing) ======
add_issue_item() { # issue number, title, milestone, status
  local num="$1" title="$2" milestone="$3" status="$4"
  local node_id
  if gh issue view "$num" -R "$OWNER/$REPO" &>/dev/null; then
    node_id=$(gh api graphql -F owner="$OWNER" -F name="$REPO" -F number="$num" -f query='
      query($owner:String!,$name:String!,$number:Int!){
        repository(owner:$owner,name:$name){ issue(number:$number){ id } }
      }' | jq -r '.data.repository.issue.id')
  else
    gh issue create -R "$OWNER/$REPO" -t "$title" -b "$title" >/dev/null
    node_id=$(gh api graphql -F owner="$OWNER" -F name="$REPO" -F number="$num" -f query='
      query($owner:String!,$name:String!,$number:Int!){
        repository(owner:$owner,name:$name){ issue(number:$number){ id } }
      }' | jq -r '.data.repository.issue.id')
  fi
  local item_id
  item_id=$(gh project item-add "$PID" --id "$node_id" --format json | jq -r '.id')
  set_single_select "$item_id" "$MILESTONE_FID" "$milestone"
  set_status "$item_id" "$status"
}

parse_items() {
  awk '
    $1=="-"{initem=1; ref=""; title=""; status=""; milestone=""; next}
    initem && $1=="ref:" {ref=$2; next}
    initem && $1=="title:" {sub("title: ",""); title=$0; gsub(/^"|?"$/,"",title); next}
    initem && $1=="status:" {status=$2; next}
    initem && $1=="milestone:" {milestone=$2; next}
    initem && /^[[:space:]]*$/ {next}
    initem && /^[^ ]/ { if (title!="") print ref "|" title "|" status "|" milestone; initem=0 }
    END{ if (initem && title!="") print ref "|" title "|" status "|" milestone; }
  ' "$CFG"
}

echo "Adding items from $CFG ..."
while IFS="|" read -r ref title status milestone; do
  ref="${ref// /}"
  title="$(echo "$title" | sed 's/^"//; s/"$//')"
  add_issue_item "$ref" "$title" "$milestone" "$status"
done < <(parse_items)

echo "All set. Opening project in browser…"
gh project view "$PID" --web || true

cat <<'NOTE'
Tips:
- If you see scope errors, refresh gh token scopes:
    gh auth refresh -h github.com -s project -s read:project -s repo
- Projects created via CLI are private by default; change visibility in the web UI if needed.
- Your account is a USER (not org); we always target user space with --owner <username>.
NOTE
