;;
;; tree sitter (for Transparency highlighting and parsing)
;; uses the built-in treesit package / tree-sitter support
;; load from your .emacs file, e.g.:
;;    (load "~/workspace/tree-sitter-transparency/.emacs")
;;

(require 'treesit)

(define-derived-mode transparency-mode prog-mode "Transparency"
  "Major mode for editing Transparency source files using Tree-sitter."
  (when (treesit-ready-p 'transparency)
    (treesit-parser-create 'transparency)

    (setq-local treesit-font-lock-feature-list
                '((comment keyword string)
		  (constant multiline format builtin)
                  (type)))

    (setq-local treesit-font-lock-settings
                (treesit-font-lock-rules

                 :default-language 'transparency

                 :feature 'comment
                 '((comment) @font-lock-comment-face)

                 :feature 'keyword
                 '((keyword) @font-lock-keyword-face)

                 :feature 'string
                 '((string_literal) @font-lock-string-face
		   (symbol_literal) @font-lock-string-face
		   (io_literal) @font-lock-string-face)

                 :feature 'constant
                 '((number_literal) @font-lock-constant-face
                   (codepoint_literal) @font-lock-constant-face
                   (boolean_literal) @font-lock-constant-face)

                 :feature 'multiline
                 '((regex_literal) @font-lock-preprocessor-face
                   (rawstring_literal) @font-lock-preprocessor-face)

                 :feature 'type
                 '((typespec) @font-lock-type-face
		   (typeunit) @font-lock-type-face)

                 :feature 'builtin
                 '((builtin) @font-lock-builtin-face
		   (ioflag_literal) @font-lock-builtin-face)

		 ))

(setq-local treesit-simple-indent-rules
  '((transparency

     ;; Closing braces align with their opening control structure
     ((node-is "}") parent-bol 0)
     ((node-is ")") parent-bol 0)
     ((node-is "]") parent-bol 0)

     ;; Top-level constructs start at column 0
     ((parent-is "source_file") parent-bol 0)

     ;; Opening braces for all definition types align with their parent
     ((and (parent-is "function_definition") (node-is "body")) parent-bol 0)
     ((and (parent-is "class_definition") (node-is "class_body")) parent-bol 0)
     ((and (parent-is "method_definition") (node-is "body")) parent-bol 0)
     ((and (parent-is "ctor_definition") (node-is "body")) parent-bol 0)
     ((and (parent-is "dtor_definition") (node-is "body")) parent-bol 0)
     ((and (parent-is "fire_definition") (node-is "body")) parent-bol 0)
     ((and (parent-is "circuit_definition") (node-is "scope")) parent-bol 0)

     ;; Control flow statements - opening braces align with control keyword
     ((and (parent-is "if_statement") (node-is "controlled")) parent-bol 0)
     ((and (parent-is "for_statement") (node-is "controlled")) parent-bol 0)
     ((and (parent-is "for_in_statement") (node-is "controlled")) parent-bol 0)
     ((and (parent-is "while_statement") (node-is "controlled")) parent-bol 0)
     ((and (parent-is "do_statement") (node-is "controlled")) parent-bol 0)
     ((and (parent-is "switch_statement") (node-is "controlled")) parent-bol 0)

     ;; When 'controlled' contains a scope, align the scope with the control statement
     ((n-p-gp "scope" "controlled" nil) parent-bol 0)

     ;; Content inside braces gets indented
     ((parent-is "scope") parent-bol 2)
     ((parent-is "class_body") parent-bol 2)

     ;; Content inside controlled statements that aren't scopes
     ((n-p-gp nil "controlled" nil) parent-bol 2)

     ;; Body can be either scope or semicolon - handle scope case
     ((and (parent-is "body") (node-is "scope")) parent-bol 0)
     ((parent-is "body") parent-bol 2)

     ;; Default case - indent by 2 spaces from parent
     ((parent-is ".+") parent-bol 2)

     )))

    (setq-local indent-line-function #'treesit-simple-indent)

    )

  (treesit-major-mode-setup))

(add-to-list 'auto-mode-alist '("\\.t$" . transparency-mode))

;; Comment filling support for Transparency mode
(add-hook 'transparency-mode-hook
  '(lambda ()
     (set-fill-column 80)
     (setq case-fold-search nil)
     (setq indent-tabs-mode nil)
     
     ;; Set up comment syntax for both // and /* */ style comments
     (setq-local comment-start "// ")
     (setq-local comment-end "")
     (setq-local comment-start-skip "\\(//+\\|/\\*+\\)\\s *")
     (setq-local comment-end-skip "\\s *\\(\\*+/\\)?")
     
     ;; Multi-line comment support
     (setq-local comment-multi-line t)
     (setq-local comment-continue " * ")
     
     ;; Enable adaptive filling for comments
     (setq-local adaptive-fill-mode t)
     (setq-local adaptive-fill-regexp "[ \t]*\\(//+[ \t]*\\|\\*+[ \t]*\\)")
     (setq-local adaptive-fill-first-line-regexp "[ \t]*\\(//+[ \t]*\\|/\\*+[ \t]*\\)")
     
     ;; Paragraph boundaries for comments
     (setq-local paragraph-start
                 (concat "\\s-*\\(//\\|\\*\\|/\\*\\)?\\s-*$\\|" paragraph-start))
     (setq-local paragraph-separate
                 (concat "\\s-*\\(//\\|\\*\\)?\\s-*$\\|" paragraph-separate))
     ) 't)
