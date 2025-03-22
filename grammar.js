/**
 * @file Transparency, a macro-dataflow language
 * @author Luddy Harrison <luddy@coreograph.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "transparency",

  extras: $ => [
    /\s/, // Whitespace
    $.comment
  ],

  rules: {

    source_file: $ => repeat(choice($.definition, $.definition_statement, $.pragma)),
    class_body: $ => seq("{", repeat(choice($.definition, $.definition_statement)), "}"),
    function_body: $ => choice(seq("{", repeat(choice($.definition_statement, $.executable_statement)), "}"), ";"),

    definition: $ => choice(
	$.class_definition,
	$.circuit_definition,
	$.method_definition
    ),
 
    definition_statement: $ => choice(
	$.function_definition,
	$.variable_definition,
	$.type_definition,
	$.constant_definition,
	$.enum_definition
    ),
 
    function_definition: $ => seq(
      choice("function", "entry"),
      $.type_tuple, 
      $.identifier, 
      $.type_tuple,
      $.function_body
    ),

    circuit_definition: $ => seq(
      "circuit",
      $.identifier,
      $.type_tuple,
      $.function_body
    ),

    method_definition: $ => seq(
      "method", 
      optional("!"), // final
      choice(seq($.identifier, ":", $.typespec, ";"),                        // data method
             seq($.type_tuple, $.identifier, $.type_tuple, $.function_body)) // function method
    ),

    class_definition: $ => seq(
      choice("class", "node"),
      $.identifier,
      optional(seq(":", $.base_specifier_list)),
      $.class_body
    ),

    base_specifier_list: $ => seq(
      $.base_specifier,
      repeat(seq(",", $.base_specifier))
    ),

    base_specifier: $ => seq(
      optional("common"),
      $.identifier
    ),

    variable_definition: $ => seq(
      choice("var", "ref"),
      $.id_list,
      choice(
        seq(":", $.typespec, optional(seq("=", $.expression))),
        seq("=", $.expression)
      ),
      ";"
    ),

    id_list: $ => seq(
      $.identifier,
      repeat(seq(",", $.identifier))
    ),

    constant_definition: $ => seq(
      "constant", 
      $.identifier, 
      optional(seq(":", $.typespec)),
      "=", 
      $.expression, 
      ";"
    ),

    type_definition: $ => seq(
      "type", 
      $.identifier, 
      "=", 
      $.typespec, 
      ";"
    ),

    enum_definition: $ => seq(
      "enum", 
      $.typespec, 
      "{", 
      repeat(seq($.identifier, optional(seq("=", $.expression)), optional(","))),
      "}"
    ),

    type: $ => choice(
      $.identifier,
      $.basic_type,
      $.type_tuple,
      $.element_type,
      $.signature_type,
    ),

    typespec: $ => choice(
      $.type,
      seq(choice("shared", "const"), $.typespec),
      seq($.type, $.type_ctor_args),
      seq($.type, "<-", $.type_tuple),
      seq($.type, "+", $.typespec)
    ),

    rank: $ => seq("{", $.intlit, "}"),

    type_tuple: $ => seq(optional($.rank), "<", optional(seq($.typespec, repeat(seq(",", $.typespec)))), ">"),

    basic_type: $ => choice(
      "string", "symbol", "regex", "match", "blob",
      "int8", "int16", "int32", "int64", "uint8", "uint16", "uint32", "uint64",
      "float32", "float64", "codepoint", "bool",
      "double", "single", "int", "uint", "char",
      "device", "buffer", "stream",
      "bitset", "idxset"
    ),

    element_type: $ => seq(
      choice("vector", "tensor", "deque", "pqueue", "wire", "set", "ordset", "list", "table", "in", "out", "trigger"),
      "<", $.typespec, ">"
    ),

    tensor_type: $ => seq("tensor", $.rank, "<", $.typespec, ">"),

    map_type: $ => seq(choice("ordmap", "map"), "<", $.typespec, ">"),

    signature_type: $ => seq(
      "[", optional(seq($.method_signature, repeat(seq(",", $.method_signature)))), "]"
    ),

    method_signature: $ => seq($.identifier, ":", $.typespec),

    qualified_type: $ => choice(
      "shared", "const"
    ),

    type_ctor_args: $ => seq(
      "[", optional(seq($.expression, repeat(seq(",", $.expression)))), "]"
    ),

    tuple_expression: $ => seq(
	"(", optional(seq($.expression, repeat(seq(",", $.expression)))), ")"
    ),

    expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $.tuple_expression,
      $.function_call,
      $.literal,
      $.identifier
    ),

    binary_expression: $ => prec.left(choice(
      seq($.expression, choice(
        "||", "&&", "==", "!=", "<", ">", "<=", ">=", 
        "|", "^", "~", "&", "<~", "~>", "+", "-", "*", "/", "%",
        "=", "+=", "-=", "*=", "/=", "%=", "|=", "&=", "^=", "~="
      ), $.expression)
    )),

    unary_expression: $ => prec.right(choice(
      seq(choice("-", "+", "!", "~", "\\"), $.expression)
    )),

    function_call: $ => seq($.identifier, "(", optional(seq($.expression, repeat(seq(",", $.expression)))), ")"),

    // this grammar allows quoted and scoped identifiers everywhere, for simplicity
    identifier: $ => choice(token(/«[^»\n]+»/), token(/[a-zA-Z_\$][a-zA-Z0-9_]*(::[a-zA-Z_\$][a-zA-Z0-9_]*)*/)),

    executable_statement: $ => seq(choice(
      $.assignment,
      $.node_instantiation,
      $.circuit_instantiation,
      $.fork_statement,
      $.return_statement
    ), ";"),
 
    assignment: $ => seq($.identifier, "=", $.expression),
    node_instantiation: $ => seq("node", optional($.intlit), optional($.strlit), $.expression),
    circuit_instantiation: $ => seq("circuit", optional($.intlit), $.expression),
    fork_statement: $ => seq(choice("fork", "spawn"), $.expression),
    return_statement: $ => seq("return", optional($.expression)),

    pragma: $ => seq("#", choice("echo", "expect", "meta", "xml"), optional($.expression)),

    // this is for things like rank that require a simple decimal integer literal
    intlit: $ => token(/[0-9]+/),
    strlit: $ => token(/"[^"]+"/),
      
    literal: $ => choice(
      $.number_literal,
      $.string_literal,
      $.rawstring_literal,
      $.boolean_literal,
      $.regex_literal
    ),

    number_literal: $ => token(/[0-9][0-9a-fA-Fx._]*([uUzZsS][0-9]+)?/),
    string_literal: $ => token(/"([^"\\]|\\.)*"/),
    codepoint_literal: $ => token(/'([^'\\]|\\.)*'/),
    boolean_literal: $ => choice("true", "false"),
    regex_literal: $ => token(seq("‹", /[^‹›]*/s, "›")),
    rawstring_literal: $ => token(seq("“", /[^“”]*/s, "”")),

    comment: $ => token(choice(
      seq("//", /.*/),
      seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")
    ))
  }
});
