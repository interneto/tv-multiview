// ESLint flat config (CommonJS — package.json is not "type": "module").
// Browser ESM for assets/js, Node CommonJS for tools/.
'use strict';

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    {
        ignores: [
            'json-tv/**',
            'assets/favicon/**',
            'assets/img/**',
            'extra/**',
            'migration/**',
            'dist/**',
            'pwabuilder-sw.js',
        ],
    },
    js.configs.recommended,
    {
        files: ['assets/js/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                // Vendored libs loaded via <script> as globals
                videojs: 'readonly',
                bootstrap: 'readonly',
                Sortable: 'readonly',
                isMobile: 'readonly',
            },
        },
        rules: {
            // Existing untyped code has latent global refs and unused imports;
            // surface them as warnings, not blocking errors.
            'no-undef': 'warn',
            'no-unused-vars': ['warn', { args: 'none' }],
        },
    },
    {
        // Tests: ESM sobre el runner de Node, así que globals de Node y de módulo.
        files: ['test/**/*.mjs'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: globals.node,
        },
    },
    {
        files: ['tools/**/*.js', '*.config.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: globals.node,
        },
        rules: {
            'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
        },
    },
];
