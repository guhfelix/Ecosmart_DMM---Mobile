module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg))',
  ],
  moduleNameMapper: {
    '^firebase/app$': '<rootDir>/node_modules/firebase/app/dist/index.cjs.js',
    '^firebase/auth$': '<rootDir>/node_modules/firebase/auth/dist/index.cjs.js',
    '^firebase/firestore$': '<rootDir>/node_modules/firebase/firestore/dist/index.cjs.js',
    '^firebase/storage$': '<rootDir>/node_modules/firebase/storage/dist/index.cjs.js',
    '^@firebase/app$': '<rootDir>/node_modules/@firebase/app/dist/index.cjs.js',
    '^@firebase/auth$': '<rootDir>/node_modules/@firebase/auth/dist/node/index.js',
    '^@firebase/firestore$': '<rootDir>/node_modules/@firebase/firestore/dist/index.node.cjs.js',
    '^@firebase/storage$': '<rootDir>/node_modules/@firebase/storage/dist/index.node.cjs.js',
    '^@firebase/util$': '<rootDir>/node_modules/@firebase/util/dist/index.cjs.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
};
