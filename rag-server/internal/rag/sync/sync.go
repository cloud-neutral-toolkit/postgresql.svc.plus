package sync

import (
	"context"
	"os"

	git "github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/transport/http"
)

// SyncRepo ensures the repository at workdir matches the remote url. It
// performs a shallow clone when the directory does not exist, otherwise a
// fetch and reset. The returned string is the current HEAD commit hash.
func SyncRepo(ctx context.Context, url, workdir string) (string, error) {
	attempt := func() (string, error) {
		if _, err := os.Stat(workdir); os.IsNotExist(err) {
			// shallow clone
			_, err := git.PlainCloneContext(ctx, workdir, false, &git.CloneOptions{
				URL:   url,
				Depth: 1,
			})
			if err != nil {
				return "", err
			}
		} else {
			r, err := git.PlainOpen(workdir)
			if err != nil {
				return "", err
			}
			// fetch
			if err := r.FetchContext(ctx, &git.FetchOptions{Depth: 1}); err != nil && err != git.NoErrAlreadyUpToDate {
				return "", err
			}
			// reset to origin/HEAD
			head, err := r.ResolveRevision(plumbing.Revision("origin/HEAD"))
			if err != nil {
				// fallback to master/main
				head, err = r.ResolveRevision(plumbing.Revision("origin/main"))
				if err != nil {
					head, err = r.ResolveRevision(plumbing.Revision("origin/master"))
					if err != nil {
						return "", err
					}
				}
			}
			w, err := r.Worktree()
			if err != nil {
				return "", err
			}
			if err := w.Reset(&git.ResetOptions{Mode: git.HardReset, Commit: *head}); err != nil {
				return "", err
			}
		}

		r, err := git.PlainOpen(workdir)
		if err != nil {
			return "", err
		}
		ref, err := r.Head()
		if err != nil {
			return "", err
		}
		return ref.Hash().String(), nil
	}

	if hash, err := attempt(); err == nil {
		return hash, nil
	}
	_ = os.RemoveAll(workdir)
	return attempt()
}

// WithAuth returns CloneOptions with basic auth if username/token provided in URL.
// This is a helper for future extension; currently unused.
func WithAuth(url, token string) *git.CloneOptions {
	opts := &git.CloneOptions{URL: url, Depth: 1}
	if token != "" {
		opts.Auth = &http.BasicAuth{Username: "token", Password: token}
	}
	return opts
}
