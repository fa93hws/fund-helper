module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/tests/**/*.tests.ts{,x}'],
  collectCoverageFrom: ['src/**/*.ts{,x}'],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/config/jest/setup.ts'],
  moduleNameMapper: {
    '.css$': 'identity-obj-proxy',
  },
  snapshotSerializers: ['enzyme-to-json/serializer', 'jest-serializer-html'],
  globals: {
    tsConfig: 'tsconfig.test.json',
    'ts-jest': {
      isolatedModules: true,
      diagnostics: {
        ignoreCodes: [151001],
      },
    },
  },
};
