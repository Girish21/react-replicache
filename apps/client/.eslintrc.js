module.exports = {
  root: true,
  plugins: ['react', 'simple-import-sort'],
  extends: ['custom', 'plugin:react/recommended', 'plugin:react/jsx-runtime'],
  rules: {
    'react/jsx-key': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
  },
}
