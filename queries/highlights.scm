(typespec) @type

(number_literal) @constant
(codepoint_literal) @constant
(boolean_literal) @constant
(ioflag_literal) @constant

(string_literal) @string
(symbol_literal) @string
(regex_literal) @string
(rawstring_literal) @string
(io_literal) @string

["(" ")" "[" "]" "{" "}" "," ";"] @punctuation
["||" "&&" "==" "!=" "<" ">" "<=" ">=" "|" "^" "~" "&" "<~" "~>" "+" "-" "*" "/" "%" "\\\\"] @builtin

(keyword) @keyword
(comment) @comment
(pragma) @preprocessor
