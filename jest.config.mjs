// Jest config for backend
export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.js'],
  collectCoverageFrom: [
    '<rootDir>/**/*.js',
    '<rootDir>/**/*.ts',
    '<rootDir>/**/*.tsx',
    '!<rootDir>/node_modules/**',
    '!<rootDir>/coverage/**',
    '!<rootDir>/src/icp-hub-frontend/**',
  ],
  moduleFileExtensions: ['js', 'ts', 'json'],
};
