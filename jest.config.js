module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  roots: ['<rootDir>/app'],
  testRegex: '(/__tests__/.*|(\.|/)(test|spec))\.tsx?$',
};
