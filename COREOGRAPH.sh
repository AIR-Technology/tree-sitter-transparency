#!/bin/bash

## this script does not build the dependences of tree-sitter, although it could in principle.

## these two commands should be run after modifying grammar.js or other dependences.

tree-sitter generate
tree-sitter build

## call tests you want to have run after rebuilding here.
## ultimately we mult populate the tests directory here.
## tst/cmp and tst/run are the obvious sources of test inputs.

#tree-sitter highlight ~/GITHUB/TransparencyCompiler/ast/ast.t
tree-sitter highlight ~/bar.t
