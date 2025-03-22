package tree_sitter_transparency_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_transparency "github.com/air-technology/tree-sitter-transparency/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_transparency.Language())
	if language == nil {
		t.Errorf("Error loading Transparency grammar")
	}
}
