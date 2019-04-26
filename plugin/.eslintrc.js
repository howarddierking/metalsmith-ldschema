module.exports = {
    extends: ['airbnb-base'],
    root: true,
    env: {
        node: true,
        es6: true,
        jest: true
    },
    parserOptions: {
        ecmaVersion: 8,
        // airbnb assumes babel and es6 modules.
        // We aren't using those, so override their setting.
        sourceType: 'script'
    },
    rules: {
        'prettier/prettier': 'error',
        'max-len': ['off'],
        // Let prettier take care of indentation
        indent: ['off'],
        'arrow-parens': ['error', 'as-needed'],
        'comma-dangle': ['error', 'never'],
        'object-curly-newline': ['error', { multiline: true, consistent: true }],
        'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
        // Let prettier take care of parenthesis newlines
        'function-paren-newline': ['off'],
        'wrap-iife': ['error', 'inside'],
        // Require strict mode on all files
        'strict': ['error', 'global']
    },
    plugins: ['prettier']
};
