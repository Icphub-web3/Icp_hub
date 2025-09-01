// Jest config for frontend
export default {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/test/**/*.test.js'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.js',
    '<rootDir>/src/**/*.ts',
    '<rootDir>/src/**/*.tsx',
    '!<rootDir>/node_modules/**',
    '!<rootDir>/coverage/**',
  ],
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
};
