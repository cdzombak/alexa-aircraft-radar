module.exports = {
  "env": {
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": 2018
  },
  "rules": {
    "accessor-pairs": ["error", { "getWithoutSet": false, "setWithoutGet": true, "enforceForClassMembers": true }],
    "array-callback-return": "error",
    "arrow-body-style": "error",
    "arrow-parens": ["error", "as-needed", { "requireForBlockBody": true }],
    "arrow-spacing": "error",
    "block-scoped-var": "error",
    "callback-return": "error",
    "class-methods-use-this": "warn",
    "consistent-return": "error",
    "curly": ["error", "multi-line"],
    "default-case": "warn",
    "default-param-last": "error",
    "dot-location": ["error", "property"],
    "eqeqeq": "error",
    "generator-star-spacing": ["error", "after"],
    "global-require": "warn",
    "handle-callback-err": "warn",
    "init-declarations": ["error", "always"],
    "no-alert": "error",
    "no-buffer-constructor": "error",
    "no-confusing-arrow": "error",
    "no-duplicate-imports": "warn",
    "no-else-return": "warn",
    "no-eq-null": "error",
    "no-eval": "error",
    "no-extra-bind": "error",
    "no-extra-label": "error",
    "no-floating-decimal": "error",
    "no-implicit-coercion": ["error", {"allow": ["!!"]}],
    "no-implied-eval": "error",
    "no-import-assign": "error",
    "no-invalid-this": "error",
    "no-iterator": "error",
    "no-label-var": "error",
    "no-labels": "warn",
    "no-lone-blocks": "error",
    "no-loop-func": "error",
    "no-new": "error",
    "no-new-func": "error",
    "no-new-require": "error",
    "no-new-wrappers": "error",
    "no-octal-escape": "error",
    "no-proto": "error",
    "no-return-assign": "error",
    "no-return-await": "error",
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-sync": "warn",
    "no-template-curly-in-string": "error",
    "no-throw-literal": "error",
    "no-unmodified-loop-condition": "warn",
    "no-unused-expressions": "error",
    "no-use-before-define": "error",
    "no-useless-call": "error",
    "no-useless-computed-key": "error",
    "no-useless-concat": "error",
    "no-useless-constructor": "error",
    "no-useless-rename": "error",
    "no-var": "error",
    "no-void": "error",
    "no-warning-comments": "warn",
    "object-shorthand": "error",
    "prefer-arrow-callback": "warn",
    "prefer-const": "error",
    "prefer-numeric-literals": "error",
    "prefer-promise-reject-errors": ["error", {"allowEmptyReject": true}],
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "prefer-template": "warn",
    "radix": "error",
    "rest-spread-spacing": "error",
    "sort-imports": "warn",
    "strict": ["error", "global"],
    "template-curly-spacing": ["warn", "never"],
    "unicode-bom": ["error", "never"],
    "vars-on-top": "error",
    "yield-star-spacing": ["error", "after"],

    // style:
    "array-bracket-newline": ["error", { "multiline": true }],
    "array-bracket-spacing": ["error", "never", { "singleValue": false, "arraysInArrays": true, "objectsInArrays": false }],
    "block-spacing": "error",
    "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
    "camelcase": "error",
    "comma-dangle": ["error", "always-multiline"],
    "comma-spacing": ["error", { "before": false, "after": true }],
    "comma-style": ["error", "last"],
    "computed-property-spacing": ["error", "never", { "enforceForClassMembers": true }],
    "eol-last": ["error", "always"],
    "func-call-spacing": ["error", "never"],
    "func-names": ["warn", "as-needed"],
    "function-call-argument-newline": ["error", "consistent"],
    "function-paren-newline": ["error", "multiline"],
    "implicit-arrow-linebreak": ["error", "beside"],
    "indent": ["error", 2],
    "key-spacing": ["error", { "beforeColon": false }],
    "keyword-spacing": "error",
    "linebreak-style": ["error", "unix"],
    "lines-between-class-members": ["error", "always"],
    "multiline-ternary": ["error", "always-multiline"],
    "new-cap": "error",
    "new-parens": "error",
    "newline-per-chained-call": ["error", { "ignoreChainWithDepth": 3 }],
    "no-array-constructor": "error",
    "no-bitwise": "error",
    "no-lonely-if": "error",
    "no-mixed-spaces-and-tabs": "error",
    "no-multi-assign": "error",
    "no-multiple-empty-lines": ["error", { "max": 1, "maxBOF": 0 }],
    "no-nested-ternary": "error",
    "no-new-object": "error",
    "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
    "no-tabs": "error",
    "no-trailing-spaces": "error",
    "no-unneeded-ternary": "error",
    "no-whitespace-before-property": "error",
    "nonblock-statement-body-position": ["error", "beside"],
    "object-curly-newline": ["error", { "multiline": true }],
    "object-curly-spacing": ["error", "always"],
    "object-property-newline": ["error", { "allowAllPropertiesOnSameLine": true }],
    "operator-assignment": ["error", "always"],
    "operator-linebreak": ["error", "before"],
    "padded-blocks": ["error", { "blocks":  "never", "switches": "never", "classes": "always" }, { allowSingleLineBlocks: true }],
    "quote-props": ["error", "as-needed", { "keywords": true }],
    "quotes": ["warn", "single", {"avoidEscape": true, "allowTemplateLiterals": true}],
    "semi": ["error", "never", { "beforeStatementContinuationChars": "always"}],
    "semi-spacing": ["error", { "before": false, "after": true }],
    "semi-style": ["error", "last"],
    "space-before-blocks": "error",
    "space-before-function-paren": ["error", {"anonymous": "never", "named": "never", "asyncArrow": "always"}],
    "space-in-parens": ["error", "never"],
    "space-infix-ops": ["error", { "int32Hint": true }],
    "space-unary-ops": "error",
    "spaced-comment": ["error", "always", { "exceptions": ["-", "*"] }],
    "switch-colon-spacing": "error",
    "template-tag-spacing": "error",
  }
};
