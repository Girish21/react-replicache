/**
 * @type {import('prettier').Options}
 */
module.exports = {
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'all',
  arrowParens: 'avoid',
  overrides: [
    {
      files: './apps/client/**/*.{js,ts,jsx,tsx}',
      options: {
        plugins: [require('prettier-plugin-tailwindcss')],
      },
    },
  ],
}
