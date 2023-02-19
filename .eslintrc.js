module.exports = {
  extends: "next/core-web-vitals",
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'jest'],
  rules : {
    'prettier/prettier': 0,
    '@typescript-eslint/no-shadow': 0,
    '@typescript-eslint/no-unused-vars': 0,
    'react/react-in-jsx-scope': 0,
    'eslint-comments/no-unlimited-disable': 0,
    'eslint-comments/no-unused-disable': 0,
    'react-hooks/rules-of-hooks': 1,
    'react-hooks/exhaustive-deps': 1,
    'react-native/no-inline-styles': 0,
    'react/no-unstable-nested-components': 0
  }
}
