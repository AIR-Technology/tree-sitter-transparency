#!/bin/bash

## this script does not build the dependences of tree-sitter, although it could in principle.

## these two commands should be run after modifying grammar.js or other dependences.

tree-sitter generate
tree-sitter build

cp -f transparency.so ~/.emacs.d/tree-sitter/libtree-sitter-transparency.so
