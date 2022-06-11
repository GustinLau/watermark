module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  plugins: ['html'],
  extends: ['prettier', 'eslint:recommended'],
  env: {
    browser: true,
    node: true,
    es6: true
  },
  rules: {
    'spaced-comment': [2, 'always', {
      'markers': ['global', 'globals', 'eslint', 'eslint-disable', '*package', '!', ',']
    }],
    'no-async-promise-executor': 'off'
  }
}
