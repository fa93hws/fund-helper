module.exports = {
  roots: ['<rootDir>'],
  preset: 'ts-jest',
  testMatch: ['**/tests/**/*.tests.ts'],
  collectCoverageFrom: ['!**/node_modules/**', 'src/**/*.(j|t)s'],
  coverageDirectory: 'coverage',
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [151001],
      },
    },
  },
  moduleNameMapper: {
    '^services/(.*)': '<rootDir>/src/services/$1',
    '^utils/(.*)': '<rootDir>/src/utils/$1',
  },
};
