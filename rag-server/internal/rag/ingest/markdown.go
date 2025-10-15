package ingest

import (
	"bytes"
	"os"
	"strings"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/text"
)

// Section represents a portion of a markdown document grouped by heading.
type Section struct {
	Heading string
	Text    string
}

// ParseMarkdown parses a markdown file into sections. It normalizes whitespace
// and preserves code fences.
func ParseMarkdown(path string) ([]Section, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	md := goldmark.New()
	doc := md.Parser().Parse(text.NewReader(b))

	var secs []Section
	var cur *Section
	var buf bytes.Buffer

	ast.Walk(doc, func(n ast.Node, entering bool) (ast.WalkStatus, error) {
		switch node := n.(type) {
		case *ast.Heading:
			if entering {
				if cur != nil {
					cur.Text = strings.TrimSpace(buf.String())
					secs = append(secs, *cur)
					buf.Reset()
				}
				cur = &Section{Heading: string(node.Text(b))}
			}
			return ast.WalkContinue, nil
		case *ast.CodeBlock:
			if entering {
				buf.WriteString("```\n")
				for i := 0; i < node.Lines().Len(); i++ {
					line := node.Lines().At(i)
					buf.Write(line.Value(b))
				}
				buf.WriteString("\n```\n")
			}
			return ast.WalkSkipChildren, nil
		case *ast.Text:
			if entering {
				buf.Write(node.Segment.Value(b))
				if node.HardLineBreak() || node.SoftLineBreak() {
					buf.WriteByte('\n')
				}
			}
		}
		return ast.WalkContinue, nil
	})

	if cur != nil {
		cur.Text = strings.TrimSpace(buf.String())
		secs = append(secs, *cur)
	}
	return secs, nil
}
