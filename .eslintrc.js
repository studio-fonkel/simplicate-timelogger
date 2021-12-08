module.exports = {
  env: {
    'es6': true,
    'browser': true,
    'node': true,
    'vue/setup-compiler-macros': true,
  },
  extends: [
    '@fonkel/eslint-config-fonkel',
    'plugin:vue/vue3-recommended',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'no-debugger': 0,
    // Vue rules
    'vue/attribute-hyphenation': ['warn', 'never', {}],
    'vue/html-self-closing': ['error', {
      html: {
        void: 'always',
        normal: 'never',
        component: 'always',
      },
      svg: 'any',
    }],
    'vue/html-closing-bracket-spacing': ['warn', {
      selfClosingTag: 'never',
    }],
    'vue/singleline-html-element-content-newline': ['off', {}],
    'vue/max-attributes-per-line': ['error', {
      singleline: 2,
      multiline: 1,
    }],
    'vue/script-indent': ['error', 2, {
      baseIndent: 1,
      switchCase: 1,
      ignores: [],
    }],
    'vue/order-in-components': ['off', {
      order: [
        'el',
        'name',
        'key',
        'parent',
        'functional',
        ['delimiters', 'comments'],
        ['components', 'directives', 'filters'],
        'extends',
        'mixins',
        ['provide', 'inject'],
        'ROUTER_GUARDS',
        'layout',
        'middleware',
        'validate',
        'scrollToTop',
        'transition',
        'loading',
        'inheritAttrs',
        'model',
        ['props', 'propsData'],
        'emits',
        'setup',
        'asyncData',
        'data',
        'fetch',
        'head',
        'computed',
        'watch',
        'watchQuery',
        'LIFECYCLE_HOOKS',
        'methods',
        ['template', 'render'],
        'renderError',
      ],
    }],
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        indent: 'off',
      },
    },
  ],
};
