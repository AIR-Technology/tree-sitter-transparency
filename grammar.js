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

    source_file: $ => repeat(choice($.definition, $.pragma)),
    class_body: $ => seq("{", repeat($.definition), "}"),

    scope: $ => seq("{", repeat(choice($.definition, $.executable_statement)), "}"),
    body: $ => choice($.scope, ";"),

    // a handful of spots in the Transparency grammar require a simple decimal or string literal
    intlit: $ => token(/[0-9]+/),
    strlit: $ => token(/"[^"]+"/),
      
    definition: $ => choice(
	$.class_definition,
	//$.circuit_definition,
	$.method_definition,
	$.function_definition,
	$.variable_definition,
	$.type_definition,
	$.constant_definition,
	$.enum_definition
    ),
 
    function_definition: $ => seq(
      alias(choice("function", "entry"), $.keyword),
      $.type_tuple, 
      $.identifier, 
      $.type_tuple,
      $.body
    ),

    circuit_definition: $ => seq(
      alias("circuit", $.keyword),
      $.identifier,
      $.type_tuple,
      $.scope
    ),

    class_definition: $ => seq(
      alias(choice("class", "node"), $.keyword),
      $.identifier,
      optional(seq(":", $.base_specifier_list)),
      $.class_body
    ),

    base_specifier_list: $ => seq(
      $.base_specifier,
      repeat(seq(",", $.base_specifier))
    ),

    base_specifier: $ => seq(
      alias(optional("common"), $.keyword),
      $.identifier
    ),

    method_definition: $ => seq(
      alias("method",  $.keyword),
      optional("!"), // final
      choice(seq($.identifier, ":", $.typespec, ";"),               // data method
             seq($.type_tuple, $.identifier, $.type_tuple, $.body)) // function method
    ),

    variable_definition: $ => seq(
      alias(choice("var", "ref"), $.keyword),
      $.id_list,
      choice(
        seq(":", $.typespec, optional(seq("=", $.initexpr))),
        seq("=", $.initexpr)
      ),
      ";"
    ),

    // this grammar allows quoted and scoped identifiers everywhere identifiers occur, for simplicity
    identifier: $ => choice(token(/«[^»\n]+»/), token(/[a-zA-Z_\$][a-zA-Z0-9_]*(::[a-zA-Z_\$][a-zA-Z0-9_]*)*/)),

    id_list: $ => seq(
      $.identifier,
      repeat(seq(",", $.identifier))
    ),

    constant_definition: $ => seq(
      alias("constant", $.keyword),
      $.identifier, 
      optional(seq(":", $.typespec)),
      "=", 
      $.initexpr,
      ";"
    ),

    type_definition: $ => seq(
      alias("type",  $.keyword),
      $.identifier, 
      "=", 
      $.typespec, 
      ";"
    ),

    enum_definition: $ => seq(
      alias("enum",  $.keyword),
      $.typespec,
      $.initializer
    ),

    typeunit: $ => choice(
      $.identifier,
      $.simple_type,
      $.rank_tuple,
      $.element_type,
      $.keyval_type,
      $.tensor_type,
      $.trigger_type,
      $.signature_type,
    ),

    typespec: $ => choice(
      $.typeunit,
      seq(alias(choice("shared", "const"), $.keyword), $.typespec),
      seq($.typeunit, $.bracket_expression),
      seq($.typeunit, "<-", $.type_tuple),
      seq($.typeunit, "+", $.typespec)
    ),

    namedtypespec: $ => seq($.typespec, optional($.identifier)),

    rank: $ => seq("{", $.intlit, "}"),

    langle: $ => "<",
    rangle: $ => ">",

    angledtypespec: $ => seq($.langle, $.typespec, $.rangle),

    type_tuple: $ => seq($.langle, optional(seq($.namedtypespec, repeat(seq(",", $.namedtypespec)))), $.rangle),

    rank_tuple: $ => seq(optional($.rank), $.type_tuple),

    simple_type: $ => choice(
      "string", "symbol", "regex", "match", "blob",
      "int8", "int16", "int32", "int64", "uint8", "uint16", "uint32", "uint64",
      "float32", "float64", "codepoint", "bool",
      "double", "single", "int", "uint", "char",
      "device", "buffer", "stream",
      "bitset", "idxset"
    ),

    element_type: $ => seq(
      choice("vector", "deque", "pqueue", "wire", "set", "ordset", "list", "table", "idxmap", "in", "out"),
      $.angledtypespec
    ),

    keyval_type: $ => seq(choice("ordmap", "map"), $.angledtypespec, "to", $.angledtypespec),

    tensor_type: $ => seq("tensor", $.rank, $.angledtypespec),

    trigger_type: $ => seq(
      alias("trigger", $.keyword),
      choice("in", "out"),
      $.angledtypespec
    ),

    signature_type: $ => seq(
      "[", optional(seq($.method_signature, repeat(seq(",", $.method_signature)))), "]"
    ),

    method_signature: $ => seq($.identifier, ":", $.typespec),

    tuple_expression: $ => seq(
	"(", optional(seq($.initexpr, repeat(seq(",", $.initexpr)))), ")"
    ),

    bracket_expression: $ => seq(
        "[", optional(seq($.initexpr, repeat(seq(",", $.initexpr)))), "]"
    ),

    initializer: $ => seq(
	"{", optional(seq($.initexpr, repeat(seq(",", $.initexpr)))), "}"
    ),

    // if we enumerate these exhaustively, then we must keep the list up to date with the compiler.
    // the advantage is the spell-checking of builtins in the editor.
    builtin: $ => choice(
      "@fwd",
      "@bwd",
      "@elt",
      "@ord",
      "@key",
      "@val",
      "@del",
      "@adv",

      "@pop",
      "@pophead",
      "@poptail",
      "@head",
      "@tail",
      "@nth",
      "@append",
      "@prepend",
      "@pushhead",
      "@pushtail",
      "@augment",
      "@remove",
      "@unique",
      "@cat",
      "@index",
      "@byte",
      "@ordinal",
      "@id",
      "@name",
      "@seek",
      "@tell",
      "@empty",
      "@full",
      "@depth",
      "@space",
      "@unused",
      "@flush",
      "@reset",
      "@accept",
      "@startrecording",
      "@stoprecording",
      "@isrecording",
      "@geterrors",
      "@seterrors",
      "@defined",
      "@refcount",
      "@cap",
      "@alignment",
      "@size",
      "@iosize",
      "@ms1",
      "@ls1",
      "@byteswap",
      "@tofloat",
      "@fromfloat",
      "@min",
      "@max",
      "@muladd",
      "@mulsub",
      "@submul",
      "@sort",
      "@getuser",
      "@setuser",
      "@clruser",
      "@schedule",
      "@get",
      "@put",
      "@join",
      "@built",
      "@ctcbuilt",
      "@ctcetc",

      "@tensor_address",
      "@tensor_allocate",
      "@tensor_bind",
      "@tensor_card",
      "@tensor_cast",
      "@tensor_dimensions",
      "@tensor_embed",
      "@tensor_empty",
      "@tensor_extract",
      "@tensor_import",
      "@tensor_index",
      "@tensor_index_address",
      "@tensor_index_offset",
      "@tensor_isdevice",
      "@tensor_ishost",
      "@tensor_length",
      "@tensor_offset",
      "@tensor_ondevice",
      "@tensor_onhost",
      "@tensor_ordinal",
      "@tensor_project",
      "@tensor_read",
      "@tensor_region",
      "@tensor_shape",
      "@tensor_size",
      "@tensor_stride",
      "@tensor_write",

      "@tensordims_align",
      "@tensordims_denormalize",
      "@tensordims_measure",
      "@tensordims_normalize"
    ),

    builtin_expression: $ => prec(10, seq($.builtin, $.expression)),

    binary_expression: $ => prec.left(choice(
      seq($.expression, choice(
        "||", "&&", "==", "!=", "<", ">", "<=", ">=", 
        "|", "^", "~", "&", "<~", "~>", "+", "-", "*", "/", "%", "\\\\"
      ), $.expression)
    )),

    unary_expression: $ => prec.right(choice(
      seq(choice("-", "+", "!", "~", "&"), $.expression)
    )),

    qual_expression: $ => prec.right(choice(
      seq(alias(choice("share", "unshare"), $.keyword), $.expression)
    )),

    card_expression: $ => prec.left(seq("|", $.expression, "|")),
    cast_expression: $ => seq($.type_tuple, $.tuple_expression),
    call_expression: $ => seq($.expression, $.tuple_expression),
    index_expression: $ => seq($.expression, "[", seq($.expression, repeat(seq(",", $.expression))), "]"),

    input_expression: $ => prec.left(seq($.type_tuple, $.io_literal, $.expression)),
    output_expression: $ => prec.right(seq($.expression, $.io_literal, $.expression)),

    expression: $ => choice(
      $.tuple_expression,
      $.bracket_expression,
      $.builtin_expression,
      $.binary_expression,
      $.unary_expression,
      $.card_expression,
      $.cast_expression,
      $.index_expression,
      $.call_expression,
      $.input_expression,
      $.output_expression,
      $.identifier,
      $.literal
    ),

    initexpr: $ => choice($.expression, $.initializer, seq($.bracket_expression, $.initializer)),
      
    //
    // these statement types have no trailing ; because they may occur in last position of for (...)
    //
    assertion: $ => seq(alias(choice("assert", "@internal"), $.keyword), $.expression),

    assignment: $ => seq($.expression,
			 choice("=", "<~=", "~>=", "+=", "-=", "*=", "/=", "%=", "|=", "&=", "^=", "~="),
			 $.expression),

    increment: $ => choice(seq($.expression, choice("++", "--")),
			   seq(choice("++", "--"), $.expression)),

    imperative: $ => choice($.assertion, $.assignment, $.increment, $.expression),

    //
    // these statement types end in a {} or ;
    //

    // no control flow transfer, no compound statements, nested scopes etc.
    simple_statement: $ => seq($.imperative, ";"),

    predicate: $ => seq("(", $.expression, ")"),
    controlled: $ => choice($.scope, $.simple_statement, ";"),

    return_statement: $ => seq(alias("return", $.keyword), optional($.expression), ";"),

    for_statement: $ => seq(alias("for", $.keyword), "(", choice($.variable_definition, $.simple_statement), optional($.expression), ";", optional($.imperative), ")", $.controlled),
    while_statement: $ => seq(alias("while", $.keyword), $.predicate, $.controlled),
    do_statement: $ => seq(alias("do", $.keyword), $.controlled, "while", $.predicate, ";"),
    if_statement: $ => seq(alias("if", $.keyword), $.predicate, $.controlled, optional(seq("else", $.controlled))),
    switch_statement: $ => seq(alias(choice("switch", "jump"), $.keyword), $.predicate, $.controlled),

    break_statement: $ => seq(alias("break", $.keyword), optional($.identifier), ";"),
    continue_statement: $ => seq(alias("continue", $.keyword), optional($.identifier), ";"),
    case_statement: $ => seq(alias("case", $.keyword), $.expression, ":"),
    default_statement: $ => seq(alias("default", $.keyword), ":"),

    node_instantiation: $ => seq(alias("node", $.keyword), optional($.intlit), optional($.strlit), $.expression, ";"),
    circuit_instantiation: $ => seq(alias("circuit", $.keyword), optional($.intlit), $.expression, ";"),
    fork_statement: $ => seq(alias(choice("fork", "spawn"), $.keyword), $.expression, ";"),

    pragma: $ => seq("#", alias(choice("echo", "expect", "meta", "xml"), $.keyword), optional($.expression)),

    executable_statement: $ => choice(

      $.simple_statement,
      $.for_statement,
      $.while_statement,
      $.do_statement,
      $.if_statement,
      $.switch_statement,
      $.case_statement,
      $.default_statement,
      $.break_statement,
      $.continue_statement,
      $.return_statement,
      $.node_instantiation,
      $.circuit_instantiation,
      $.fork_statement,
      $.body

    ),

    literal: $ => choice(
      $.number_literal,
      $.string_literal,
      $.symbol_literal,
      $.codepoint_literal,
      $.boolean_literal,
      $.regex_literal,
      $.rawstring_literal,
      $.io_literal,
      $.ioflag_literal
    ),

    number_literal: $ => token(/[0-9][0-9a-fA-Fx._]*([uUzZsS][0-9]*)?/),
    string_literal: $ => token(/"([^"\\]|\\.)*"/),
    symbol_literal: $ => token(/`([^`\\]|\\.)*`/),
    codepoint_literal: $ => token(/('([^'\\]|\\.)*')|\\u[0-9a-fA-F]+/),
    boolean_literal: $ => choice("true", "false"),
    regex_literal: $ => token(seq("‹", /[^‹›]*/s, "›")),
    rawstring_literal: $ => token(seq("“", /[^“”]*/s, "”")),
    io_literal: $ => token(/<:[^:]*:/),
    ioflag_literal: $ => choice(
      "@stdin",
      "@stdout",
      "@stderr",
      "@file",
      "@udp",
      "@tcp",
      "@tls",
      "@in",
      "@out",
      "@xst",
      "@new",
      "@crt",
      "@ovw",
      "@cli",
      "@srv",
      "@seq",
      "@rnd",
      "@mmp",
      "@acc",
      "@flx",
      "@le",
      "@be",
      "@bin",
      "@utf8",
      "@utf16",
      "@utf32"
      ),

    comment: $ => token(choice(
      seq("//", /.*/),
      seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")
    ))
  }
});
