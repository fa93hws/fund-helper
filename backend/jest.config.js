module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/tests/**/*.tests.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  globals: {
    'ts-jest': {
      isolatedModules: true,
      diagnostics: {
        ignoreCodes: [151001],
      },
    },
  },
};
