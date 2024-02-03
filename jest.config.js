/** @type {import('jest').Config} */
const config = {
  verbose: true,
  transform: {},
  extensionsToTreatAsEsm: ['.ts', '.js', '.jsx', '.tsx'],
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/test/tsconfig.json',
    },
  },
  transformIgnorePatterns: ['node_modules/(?!troublesome-dependency/.*)'],
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
  },
};

module.exports = config;
