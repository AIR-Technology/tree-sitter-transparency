;; this .emacs file contains the indentation logic for tree-sitter,
;; that's why it's maintained the tree-sitter-transparency repo.

(add-to-list 'package-archives '("melpa-stable" . "https://melpa.org/packages/melpa-stable/"))

;; --- startup and important keys
;(setq mac-command-modifier 'meta)
;(setq mac-option-modifier 'control)
(setq browse-url-browser-function 'browse-url-chrome)
(setq x-super-keysym 'meta)
(setq startup-screen-inhibit-startup-screen 't)
(setq ns-pop-up-frames nil)
(setq indent-tabs-mode nil)
(menu-bar-mode -1)
(desktop-read)

;; turn off window dedication altogether
(defun set-window-undedicated-p (window flag) "Never set window dedicated." flag)
(advice-add 'set-window-dedicated-p :override #'set-window-undedicated-p)

(setq-default cursor-type 'box)
(blink-cursor-mode nil)
(size-indication-mode 't)

(put 'downcase-region 'disabled nil)
(put 'upcase-region 'disabled nil)
(put 'scroll-left 'disabled nil)
(put 'narrow-to-region 'disabled nil)
(put 'set-goal-column 'disabled t)

;; this is a nice, bright color that we aren't using currently:
;; '(font-lock-some-face ((t (:foreground "#00f2e4"))))

;; leave the font family and foundry alone here.  emacs-30 with X
;; support uses a nice font by default.

(custom-set-faces
 '(default ((t (:inherit nil :stipple nil :background "Black" :foreground "White" :inverse-video nil :box nil :strike-through nil :overline nil :underline nil :slant normal :weight normal :height 200 :width normal))))
 '(font-lock-builtin-face ((t (:foreground "#888"))))
 '(font-lock-comment-face ((t (:foreground "firebrick3"))))
 '(font-lock-constant-face ((t (:foreground "#bfe"))))
 '(font-lock-keyword-face ((t (:foreground "#1cf"))))
 '(font-lock-preprocessor-face ((t (:foreground "#0f0"))))
 '(font-lock-string-face ((t (:foreground "#b668f2"))))
 '(font-lock-format-face ((t (:foreground "#ffd000"))))
 '(font-lock-type-face ((t (:foreground "#48d1cc")))))

(custom-set-variables
 '(case-fold-search nil)
 '(visible-bell t)
 '(column-number-mode t)
 '(display-time-mode t)
 '(fill-column 80)
 '(package-selected-packages '(org magit))
 '(scroll-bar-mode nil)
 '(size-indication-mode t)
 '(tool-bar-mode nil)
 '(tooltip-mode nil)
 '(truncate-lines t)
 '(typescript-indent-level 2))

;; i copied this stuff here because i can never remember the key binding for or the name of text-scale-adjust.
;;;###autoload (define-key ctl-x-map [(control ?+)] 'text-scale-adjust)
;;;###autoload (define-key ctl-x-map [(control ?-)] 'text-scale-adjust)
;;;###autoload (define-key ctl-x-map [(control ?=)] 'text-scale-adjust)
;;;###autoload (define-key ctl-x-map [(control ?0)] 'text-scale-adjust)

;; --- file modes
(setq auto-mode-alist (cons '("\\.h\\'" . c++-mode) auto-mode-alist))
(setq auto-mode-alist (cons '("\\.c\\'" . c++-mode) auto-mode-alist))
(setq auto-mode-alist (cons '("\\.H\\'" . c++-mode) auto-mode-alist))
(setq auto-mode-alist (cons '("\\.C\\'" . c++-mode) auto-mode-alist))
(setq auto-mode-alist (cons '("\\.cu\\'" . c++-mode) auto-mode-alist))
(setq auto-mode-alist (cons '("\\.txt\\'" . text-mode) auto-mode-alist))
(setq auto-mode-alist (cons '("\\.asc\\'" . doc-mode) auto-mode-alist))
(setq auto-mode-alist (cons '("\\.s\\'" . asm-mode) auto-mode-alist))
(setq auto-mode-alist (cons '("\\.asm\\'" . asm-mode) auto-mode-alist))
(setq auto-mode-alist (cons '("\\.md\\'" . markdown-mode) auto-mode-alist))
(setq auto-mode-alist (cons '("\\.ts\\'" . typescript-mode) auto-mode-alist))
(setq auto-mode-alist (cons '("\\.tsx\\'" . typescript-mode) auto-mode-alist))

(add-hook 'c-mode-hook '(lambda () (set-fill-column 80) (setq case-fold-search nil) (setq indent-tabs-mode nil)) 't)
(add-hook 'c++-mode-hook '(lambda () (set-fill-column 80) (setq case-fold-search nil) (setq indent-tabs-mode nil)) 't)
(add-hook 'text-mode-hook '(lambda () (auto-fill-mode 0) (set-fill-column 80) (setq case-fold-search nil) (setq indent-tabs-mode nil)) 't)
(add-hook 'asm-mode-hook '(lambda () (set-fill-column 80) (setq fill-prefix "\t// ")  (setq case-fold-search nil) (setq indent-tabs-mode nil)) 't)
(add-hook 'html-mode-hook '(lambda () (set-fill-column 80) (setq case-fold-search nil) (setq indent-tabs-mode nil)) 't)
(add-hook 'javascript-mode-hook '(lambda () (auto-fill-mode 0) (setq case-fold-search nil) (setq indent-tabs-mode nil)) 't)
(add-hook 'typescript-mode-hook '(lambda () (auto-fill-mode 0) (setq case-fold-search nil) (setq indent-tabs-mode nil)) 't)
(add-hook 'window-scroll-functions '(lambda (window startp) (redraw-frame)))

(setq c-defun-tactic nil)
(setq asm-comment-char ?\#)

;; --- load additional .el files

(defun renum (low regexp) (interactive "P\nsregexp: ")
  (save-excursion
    (let ((n low))
      (goto-char (point-min))
      (while (and (re-search-forward regexp nil t)
		  (re-search-forward "\\([0-9]+\\)" nil t))
	(replace-match (concat "" (number-to-string n)) nil nil)
	(setq n (+ n 1)))
      )))

(defun setfillcolumn () (interactive)
  (save-excursion
    (end-of-line)
    (let ((e (point)))
      (beginning-of-line)
      (let ((b (point)))
	(set-fill-column (- e b))))))

(defun setfillcolumnandfill (arg) (interactive "P")
  (save-excursion
    (setfillcolumn nil)
    (c-fill-paragraph arg)))

(defun insertmain () (interactive)
       (progn (save-excursion
		(insert "function <int> main <>\n{\n  \n}\n"))
	      (forward-line 2)
	      (end-of-line)))

;; create minimal TAGS files based on file extensions
;; these are good for tags-search and tags-query-replace,
;; but not for definition/declaration stuff.

(defun maketags () (interactive)
  (progn
    (shell-command "find -L . -name \\*.t -type f -fprintf TAGS \"\\f\\n%p,0\\n\"")
    (visit-tags-table "./TAGS")))
(defun maketxttags () (interactive)
  (progn
    (shell-command "find -L . -name \\*.txt -type f -fprintf TAGS \"\\f\\n%p,0\\n\"")
    (visit-tags-table "./TAGS")))
(defun makectags () (interactive)
  (progn
    (shell-command "find -L . -name \\*.c -type f -fprintf TAGS \"\\f\\n%p,0\\n\"")
    (visit-tags-table "./TAGS")))
(defun makehtags () (interactive)
  (progn
    (shell-command "find -L . -name \\*.h -type f -fprintf TAGS \"\\f\\n%p,0\\n\"")
    (visit-tags-table "./TAGS")))
(defun makechtags () (interactive)
  (progn
    (shell-command "find -L . \\( -name \\*.c -o -name \\*.h \\) -type f -fprintf TAGS \"\\f\\n%p,0\\n\"")
    (visit-tags-table "./TAGS")))
(defun makecpptags () (interactive)
  (progn
    (shell-command "find -L . \\( -name \\*.c -o -name \\*.cpp -o -name \\*.h -o -name \\*.hpp \\) -type f -fprintf TAGS \"\\f\\n%p,0\\n\"")
    (visit-tags-table "./TAGS")))
(defun makeasctags () (interactive)
  (progn
    (shell-command "find -L . -name \\*.asc -type f -fprintf TAGS \"\\f\\n%p,0\\n\"")
    (visit-tags-table "./TAGS")))
(defun makeasmtags () (interactive)
  (progn
    (shell-command "find -L . -name \\*.s -type f -fprintf TAGS \"\\f\\n%p,0\\n\"")
    (visit-tags-table "./TAGS")))
(defun makesrctags () (interactive)
  (progn
    (shell-command "find -L . \\( -name \\*.c -o -name \\*.h -o -name \\*.s -o -name \\*.t \\) -type f -fprintf TAGS \"\\f\\n%p,0\\n\"")
    (visit-tags-table "./TAGS")))
(defun makeglsltags () (interactive)
  (progn
    (shell-command "find -L . \\( -name \\*.frag -o -name \\*.vert -o -name \\*.geom \\) -type f -fprintf TAGS \"\\f\\n%p,0\\n\"")
    (visit-tags-table "./TAGS")))
(defun makejstags () (interactive)
  (progn
    (shell-command "find -L . -name \\*.js -type f -fprintf TAGS \"\\f\\n%p,0\\n\"")
    (visit-tags-table "./TAGS")))
(defun maketstags () (interactive)
  (progn
    (shell-command "find -L . \\( -name \\*.ts -o -name \\*.tsx \\) -type f -fprintf TAGS \"\\f\\n%p,0\\n\"")
    (visit-tags-table "./TAGS")))
(defun makejsontags () (interactive)
  (progn
    (shell-command "find -L . -name \\*.json -type f -fprintf TAGS \"\\f\\n%p,0\\n\"")
    (visit-tags-table "./TAGS")))
(defun makehtmltags () (interactive)
  (progn
    (shell-command "find -L . -name \\*.html -type f -fprintf TAGS \"\\f\\n%p,0\\n\"")
    (visit-tags-table "./TAGS")))
(defun makemaketags () (interactive)
  (progn
    (shell-command "find -L . -name Makefile -type f -fprintf TAGS \"\\f\\n%p,0\\n\"")
    (visit-tags-table "./TAGS")))
(defun makelinkerflagstags () (interactive)
  (progn
    (shell-command "find -L . -name linker.flags -type f -fprintf TAGS \"\\f\\n%p,0\\n\"")
    (visit-tags-table "./TAGS")))

;; run make clean and then maketags, idea being to delete generated .t files first
(defun makecleantags () (interactive) (progn (shell-command "make clean") (maketags)))

;;《.》
(defun insert-macro  () (interactive) (insert-char #x300A) (insert-char #x300B) (backward-char 1))

;; «.»
(defun insert-quote  () (interactive) (insert-char #x00AB) (insert-char #x00BB) (backward-char 1))

;; ‘.’
(defun insert-unquote  () (interactive) (insert-char #x2018) (insert-char #x2019) (backward-char 1))

;; ‹.›
(defun insert-regex  () (interactive) (insert-char #x2039) (insert-char #x203A) (backward-char 1))

;; “.”
(defun insert-rawstring  () (interactive) (insert-char #x201C) (insert-char #x201D) (backward-char 1))

(global-set-key "m" 'magit)
(global-set-key "f" 'setfillcolumn)
(global-set-key "o" 'other-frame)
(global-set-key "n" 'insert-macro)
(global-set-key "q" 'insert-quote)
(global-set-key "u" 'insert-unquote)
(global-set-key "r" 'insert-regex)
(global-set-key "s" 'insert-rawstring)

(global-set-key "m" 'insertmain)

(global-set-key (kbd "M-,") 'tags-loop-continue)

;; these are terribly annoying if typed accidentally
(global-unset-key "")
(global-unset-key "")

;;
;; tree sitter (for Transparency highlighting and parsing)
;; uses the built-in treesit package / tree-sitter support
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

(add-hook 'transparency-mode-hook '(lambda () (set-fill-column 80) (setq case-fold-search nil) (setq indent-tabs-mode nil)) 't)
