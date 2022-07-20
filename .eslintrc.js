module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:import/react-native',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'import', 'jsx-a11y', 'prettier'],
  env: {
    es6: true,
    'jest/globals': true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'react/display-name': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        singleQuote: true,
        semi: true,
        trailingComma: 'es5',
        printWidth: 120,
        tabWidth: 2,
        arrowParens: 'always',
        bracketSpacing: true,
        overrides: [
          {
            files: '*.html',
            options: { parser: 'babel' },
          },
        ],
      },
    ],
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-object-literal-type-assertion': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'class-methods-use-this': 'off',
    'import/default': 'error',
    'import/extensions': [
      'error',
      'never',
      {
        ignorePackages: true,
        json: 'always',
        md: 'always',
        svg: 'always',
        tag: 'always',
        png: 'always',
      },
    ],
    'import/named': 'off',
    'import/namespace': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        peerDependencies: true,
        optionalDependencies: true,
      },
    ],
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'jsx-a11y/accessible-emoji': 'off',
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['A', 'LinkTo'],
        specialLink: ['overrideParams', 'kind', 'story', 'to'],
      },
    ],
    'jsx-a11y/label-has-associated-control': [
      'warn',
      {
        controlComponents: ['CustomInput'],
        depth: 3,
        labelAttributes: ['label'],
        labelComponents: ['CustomInputLabel'],
      },
    ],
    'jsx-a11y/label-has-for': [
      'error',
      {
        required: {
          some: ['nesting', 'id'],
        },
      },
    ],
    'max-classes-per-file': 'off',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'lodash.isequal',
            message:
              'Lodash modularised (and lodash < 4.17.11) have CVE vulnerabilities. Please use tree-shakeable imports like lodash/xxx instead',
          },
          {
            name: 'lodash.uniqueId',
            message:
              'Lodash modularised (and lodash < 4.17.11) have CVE vulnerabilities. Please use tree-shakeable imports like lodash/xxx instead',
          },
          {
            name: 'lodash.mergewith',
            message:
              'Lodash modularised (and lodash < 4.17.11) have CVE vulnerabilities. Please use tree-shakeable imports like lodash/xxx instead',
          },
          {
            name: 'lodash.pick',
            message:
              'Lodash modularised (and lodash < 4.17.11) have CVE vulnerabilities. Please use tree-shakeable imports like lodash/xxx instead',
          },
        ],
        // catch-all for any lodash modularized.
        // The CVE is listed against the entire family for lodash < 4.17.11
        patterns: ['lodash.*'],
      },
    ],
    'react/jsx-filename-extension': [
      'warn',
      {
        extensions: ['.js', '.jsx', '.tsx'],
      },
    ],
    'react/jsx-fragments': 'off',
    'react/jsx-no-bind': [
      'error',
      {
        allowArrowFunctions: true,
        allowBind: true,
        allowFunctions: true,
        ignoreDOMComponents: true,
        ignoreRefs: true,
      },
    ],
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/no-unescaped-entities': 'off',
    'react/sort-comp': [
      'error',
      {
        groups: {
          staticLifecycle: ['displayName', 'propTypes', 'defaultProps', 'getDerivedStateFromProps'],
        },
        order: [
          'staticLifecycle',
          'static-methods',
          'instance-variables',
          'lifecycle',
          '/^on.+$/',
          '/^(get|set)(?!(DerivedStateFromProps|SnapshotBeforeUpdate$)).+$/',
          'instance-methods',
          'instance-variables',
          'everything-else',
          'render',
        ],
      },
    ],
    'react/state-in-constructor': 'off',
    'react/static-property-placement': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/core-modules': ['enzyme'],
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx', '.mjs', '.d.ts'],
        paths: ['node_modules/', 'node_modules/@types/'],
      },
    },
  },
  overrides: [
    {
      files: ['**/*.tsx', '**/*.ts'],
      rules: {
        'react/require-default-props': 'off',
        'react/prop-types': 'off', // we should use types
        'react/forbid-prop-types': 'off', // we should use types
      },
    },
    {
      files: ['**/*.d.ts'],
      rules: {
        'vars-on-top': 'off',
        'no-var': 'off', // this is how typescript works
        'spaced-comment': 'off',
      },
    },
  ],
};
