const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThresholds: [
    {
      glob: 'src/**/*.tsx',
      branches: 40,
      functions: 60,
      lines: 70,
      statements: 70,
    },
    {
      glob: 'src/**/*.ts',
      branches: 30,
      functions: 50,
      lines: 70,
      statements: 70,
    },
  ],
};

module.exports = createJestConfig(customJestConfig);