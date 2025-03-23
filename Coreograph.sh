#!/bin/bash

tree-sitter generate
tree-sitter build

#tree-sitter highlight ~/GITHUB/TransparencyCompiler/ast/ast.t
tree-sitter highlight ~/foo.t
