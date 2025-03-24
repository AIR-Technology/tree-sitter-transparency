(typespec) @type

(number_literal) @constant
(codepoint_literal) @constant
(boolean_literal) @constant

(string_literal) @string
(symbol_literal) @string

(regex_literal) @multiline
(rawstring_literal) @multiline

(io_literal) @format

(ioflag_literal) @builtin
(builtin) @builtin

["||" "&&" "==" "!=" "<" ">" "<=" ">=" "|" "^" "~" "&" "<~" "~>" "+" "-" "*" "/" "%" "\\\\"] @punctuation
["(" ")" "[" "]" "{" "}" "," ";"] @punctuation

(keyword) @keyword
(comment) @comment
(pragma) @preprocessor
