package ingest

import (
	"io"
	"os"
	"path/filepath"
	"strings"
)

// ListMarkdown walks root and returns markdown files respecting include and ignore lists.
// If maxFiles > 0 the result is limited to at most that many paths.
func ListMarkdown(root string, includeExts, ignoreDirs []string, maxFiles int) ([]string, error) {
	var files []string
	include := make(map[string]struct{})
	for _, e := range includeExts {
		include[strings.ToLower(e)] = struct{}{}
	}
	ignores := make(map[string]struct{})
	for _, d := range ignoreDirs {
		ignores[d] = struct{}{}
	}

	err := filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		if d.IsDir() {
			if _, ok := ignores[d.Name()]; ok {
				return filepath.SkipDir
			}
			return nil
		}
		if maxFiles > 0 && len(files) >= maxFiles {
			return io.EOF
		}
		ext := strings.ToLower(filepath.Ext(path))
		if _, ok := include[ext]; ok {
			files = append(files, path)
		}
		return nil
	})
	if err != nil && err != io.EOF {
		return nil, err
	}
	return files, nil
}
