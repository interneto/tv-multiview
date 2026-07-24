// ESLint flat config (CommonJS — package.json is not "type": "module").
// Browser ESM for assets/js, Node CommonJS for tools/.
'use strict';

const js = require('@eslint/js');

const browserGlobals = {
    window: 'readonly',
    document: 'readonly',
    navigator: 'readonly',
    localStorage: 'readonly',
    location: 'readonly',
    console: 'readonly',
    fetch: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    requestAnimationFrame: 'readonly',
    cancelAnimationFrame: 'readonly',
    AbortController: 'readonly',
    AbortSignal: 'readonly',
    queueMicrotask: 'readonly',
    IntersectionObserver: 'readonly',
    MutationObserver: 'readonly',
    Audio: 'readonly',
    screen: 'readonly',
    Node: 'readonly',
    CustomEvent: 'readonly',
    URL: 'readonly',
    URLSearchParams: 'readonly',
    history: 'readonly',
    // Vendored libs loaded via <script> as globals
    videojs: 'readonly',
    bootstrap: 'readonly',
    Sortable: 'readonly',
    isMobile: 'readonly',
};

const nodeGlobals = {
    require: 'readonly',
    module: 'writable',
    process: 'readonly',
    __dirname: 'readonly',
    console: 'readonly',
    fetch: 'readonly',
};

module.exports = [
    {
        ignores: [
            'json-tv/**',
            'assets/favicon/**',
            'assets/img/**',
            'pwabuilder-sw.js',
            '.worktrees/**',
            '.claude/worktrees/**',
        ],
    },
    js.configs.recommended,
    {
        files: ['extra/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: { ...browserGlobals, window: 'readonly' },
        },
    },
    {
        files: ['assets/js/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: browserGlobals,
        },
        rules: {
            'no-unused-vars': ['warn', { args: 'none' }],
        },
    },
    {
        files: ['tools/**/*.js', '*.config.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: nodeGlobals,
        },
    },
];
