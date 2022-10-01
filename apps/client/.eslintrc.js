module.exports = {
  root: true,
  plugins: ["react"],
  extends: ["custom", "plugin:react/recommended", "plugin:react/jsx-runtime"],
  rules: {
    "react/jsx-key": "off",
  },
};
