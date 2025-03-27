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

    source_file: $ => repeat(choice($.class_scope_definition, $.pragma)),
    class_body: $ => seq("{", repeat($.class_scope_definition), "}"),

    scope: $ => prec(20, seq("{", repeat(choice($.function_scope_definition, $.executable_statement)), "}")),
    body: $ => choice($.scope, ";"),

    // a handful of spots in the Transparency grammar require a simple decimal or string literal
    intlit: $ => token(/[0-9]+/),
    strlit: $ => token(/"[^"]+"/),

    // these definitions are OK in function scope
    function_scope_definition: $ => choice(
	$.function_definition,
	$.variable_definition,
	$.comprehension_definition,
	$.type_definition,
	$.constant_definition,
	$.enum_definition
    ),

    // these definitions are OK in class scope
    class_scope_definition: $ => choice(
      $.function_scope_definition,
      $.class_definition,
      $.method_definition,
      $.ctor_definition,
      $.dtor_definition,
      $.fire_definition,
      $.circuit_definition,
      $.implements_declaration,
      ";"	
    ),

    implements_declaration: $ => seq(alias("implements", $.keyword), $.typespec, ";"),

    function_definition: $ => seq(
      alias(choice("function", "entry"), $.keyword),
      $.typetuple, 
      $.identifier, 
      $.typetuple,
      $.body
    ),

    circuit_definition: $ => seq(
      alias("circuit", $.keyword),
      $.identifier,
      $.typetuple,
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

    ctor_definition: $ => seq(
      alias(token(/([a-zA-Z0-9_\$]+::)*ctor/), $.keyword),
      $.typetuple,
      optional($.ctorinits),
      $.body
    ),

    dtor_definition: $ => seq(
      alias(token(/([a-zA-Z0-9_\$]+::)*dtor/), $.keyword),
      $.body
    ),

    fire_definition: $ => seq(
      alias(token(/([a-zA-Z0-9_\$]+::)*fire/), $.keyword),
      $.body
    ),

    method_definition: $ => seq(
      alias("method",  $.keyword),
      optional("!"), // final
      choice(seq($.identifier, ":", $.typespec, ";"),               // data method
             seq($.typetuple, $.identifier, $.typetuple, $.body)) // function method
    ),

    variable_definition: $ => seq(
      alias(choice("var", "ref"), $.keyword),
      $.id_list,
      choice(
        seq(":", $.typespec, optional(seq("=", $.expression))),
        seq("=", $.expression)
      ),
      ";"
    ),

    comprehension_definition: $ => seq(
      alias(choice("var", "ref"), $.keyword),
      seq("(", $.id_list, ")"),
      choice(
        seq(":", $.typespec, optional(seq("=", $.expression))),
        seq("=", $.expression)
      ),
      ";"
    ),

    ctorinit: $ => seq($.identifier, $.tuple_expression),
    ctorinits: $ => seq(optional(":"), seq($.ctorinit, repeat(seq(",", $.ctorinit)))),

    // this grammar allows quoted and scoped identifiers everywhere identifiers occur, for simplicity
    identifier: $ => choice(token(/«[^»\n]+»/), token(/([a-zA-Z0-9_\$]+::)*[a-zA-Z0-9_\$]+/)),

    id_list: $ => seq(
      $.identifier,
      repeat(seq(",", $.identifier))
    ),

    constant_definition: $ => seq(
      alias("constant", $.keyword),
      $.identifier, 
      optional(seq(":", $.typespec)),
      "=", 
      $.expression,
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
      "{",
      $.id_list,
      "}"
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
      seq($.typeunit, "<-", $.typetuple),
      seq($.typeunit, "+", $.typespec)
    ),

    namedtypespec: $ => seq($.typespec, optional($.identifier)),

    rank: $ => seq("{", $.intlit, "}"),

    langle: $ => "<",
    rangle: $ => ">",

    typetuple: $ => seq($.langle, optional(seq($.namedtypespec, repeat(seq(",", $.namedtypespec)))), $.rangle),

    rank_tuple: $ => seq(optional($.rank), $.typetuple),

    simple_type: $ => choice(
      "int8", "int16", "int32", "int64",
      "uint8", "uint16", "uint32", "uint64",
      "float32", "float64",
      "codepoint", "bool",
      "double", "single", "int", "uint", "char",
      "string", "symbol", "regex", "match", "blob",
      "device", "buffer", "stream",
      "bitset", "idxset"
    ),

    element_type: $ => seq(
      choice("vector", "deque", "pqueue", "wire", "set", "ordset", "list", "table", "idxmap", "in", "out"),
      $.typetuple
    ),

    keyval_type: $ => seq(choice("ordmap", "map"), $.typetuple, "to", $.typetuple),

    tensor_type: $ => seq("tensor", $.rank, $.typetuple),

    trigger_type: $ => seq(
      alias("trigger", $.keyword),
      choice("in", "out"),
      $.typetuple
    ),

    signature_type: $ => seq(
      "[", optional(seq($.method_signature, repeat(seq(",", $.method_signature)))), "]"
    ),

    method_signature: $ => seq($.identifier, ":", $.typespec),

    tuple_expression: $ => seq(
	"(", optional(seq($.expression, repeat(seq(",", $.expression)))), ")"
    ),

    bracket_expression: $ => seq(
        "[", optional(seq($.expression, repeat(seq(",", $.expression)))), "]"
    ),

    initializer: $ => prec.left(11, seq(
         optional($.bracket_expression), "{", optional(seq($.expression, repeat(seq(",", $.expression)))), "}"
    )),

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
      token(/@getuser[0-9abAB]/),
      token(/@setuser[0-9abAB]/),
      token(/@clruser[0-9abAB]/),
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

    ternary_expression: $ => prec.left(
      seq($.expression, "?", $.expression, ":", $.expression)
    ),

    binary_expression: $ => choice(
      prec.left(1, seq($.expression, choice("==", "!=", "<", ">", "<=", ">="), $.expression)),
      prec.left(2, seq($.expression, choice("||", "&&", ), $.expression)),
      prec.left(3, seq($.expression, "\\\\", $.expression)),
      prec.left(4, seq($.expression, choice("|", "^", "~", "&"), $.expression)),
      prec.left(5, seq($.expression, choice("<~", "~>"), $.expression)),
      prec.left(6, seq($.expression, choice("+", "-"), $.expression)),
      prec.left(7, seq($.expression, choice("*", "/", "%"), $.expression)),
    ),

    unary_expression: $ => prec.right(10,
      seq(choice("-", "+", "!", "~", "&"), $.expression)
    ),

    qual_expression: $ => prec.right(
      seq(alias(choice("share", "unshare"), $.keyword), $.expression)
    ),

    choose_expression: $ => seq($.expression, "??", "{" , seq(choice(seq($.literal, ":", $.expression), $.expression), repeat(seq(",", choice(seq($.literal, ":", $.expression), $.expression)))), "}"),

    card_expression: $ => prec.left(seq("|", $.expression, "|")),
    cast_expression: $ => seq($.typetuple, $.tuple_expression),
    call_expression: $ => seq(choice(seq($.typetuple, choice($.identifier, $.string_literal)), $.expression), $.tuple_expression),
    index_expression: $ => seq($.expression, "[", seq($.expression, repeat(seq(",", $.expression))), "]"),
    select_expression: $ => seq($.expression, ".", $.identifier),
    method_expression: $ => prec.left(12, seq($.expression, "->", optional($.typetuple), $.identifier, optional($.typetuple))),

    input_expression: $ => prec.left(seq($.typetuple, $.io_literal, $.expression)),
      output_expression: $ => prec.right(seq($.expression, $.io_literal, $.expression)),

      expression: $ => choice(
      $.initializer,
      $.bracket_expression,
      $.tuple_expression,
      $.builtin_expression,
      $.ternary_expression,
      $.binary_expression,
      $.unary_expression,
      $.qual_expression,
      $.card_expression,
      $.cast_expression,
      $.index_expression,
      $.select_expression,
      $.method_expression,
      $.call_expression,
      $.input_expression,
      $.output_expression,
      $.choose_expression,
      $.identifier,
      $.literal,
      $.closure
    ),

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
    transfer_statement: $ => choice($.return_statement, $.break_statement, $.continue_statement),

    // the Transparency grammar allows an unparenthesized expression here
    predicate: $ => seq("(", $.expression, ")"),
      
    controlled: $ => choice($.scope, $.simple_statement, $.transfer_statement, $.for_statement, $.for_in_statement, $.do_statement, $.while_statement, $.switch_statement, ";"),
    else_controlled: $ => choice($.controlled, $.if_statement),

    return_statement: $ => seq(alias("return", $.keyword), optional($.expression), ";"),

    for_statement: $ => seq(alias("for", $.keyword), "(", choice($.variable_definition, $.simple_statement), optional($.expression), ";", optional($.imperative), ")", $.controlled),
    for_in_statement: $ => seq(alias("for", $.keyword), optional(alias(choice("var","ref"),$.keyword)), $.identifier, optional(alias("in", $.keyword)), $.expression, choice(seq("do", $.controlled), $.body)),
    while_statement: $ => seq(alias("while", $.keyword), $.predicate, $.controlled),
    do_statement: $ => seq(alias("do", $.keyword), $.controlled, "while", $.predicate, ";"),
    if_statement: $ => seq(alias("if", $.keyword), $.predicate, $.controlled, optional(seq(alias("else", $.keyword), $.else_controlled))),
    switch_statement: $ => seq(alias(choice("switch", "jump"), $.keyword), $.predicate, $.controlled),

    break_statement: $ => seq(alias("break", $.keyword), optional($.identifier), ";"),
    continue_statement: $ => seq(alias("continue", $.keyword), optional($.identifier), ";"),

    // this is a lot more lenient, in respect to case/default, than the actual grammar,
    // but I think it makes it easier to get the indentation right around these statement types.
    labeled_statement: $ => seq(choice($.identifier, 
				       seq(alias("case", $.keyword), $.expression),
				       alias("default", $.keyword)),
				":"),

    node_instantiation: $ => seq(alias("node", $.keyword), optional($.intlit), optional($.strlit), $.expression, ";"),
    circuit_instantiation: $ => seq(alias("circuit", $.keyword), optional($.intlit), $.expression, ";"),
    fork_statement: $ => seq(alias(choice("fork", "spawn"), $.keyword), $.expression, ";"),

    pragma: $ => seq("#", alias(choice("echo", "expect", "meta", "xml"), $.keyword), optional($.expression)),

    executable_statement: $ => choice(

      $.simple_statement,
      $.for_statement,
      $.for_in_statement,
      $.while_statement,
      $.do_statement,
      $.if_statement,
      $.switch_statement,
      $.break_statement,
      $.continue_statement,
      $.labeled_statement,
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

    closure: $ => choice(seq($.typetuple, "<-", $.typetuple, $.scope),
			 seq($.typetuple, $.identifier, $.typetuple)),

    comment: $ => token(choice(
      seq("//", /.*/),
      seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")
    ))
  }
});
