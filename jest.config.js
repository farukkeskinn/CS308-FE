// jest.config.js
module.exports = {
    testEnvironment: "jsdom",
    transform: {
      "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
    },
    moduleNameMapper: {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    },
    transformIgnorePatterns: [
      "node_modules/(?!(axios)/)"
    ],
    setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
    moduleFileExtensions: ["js", "jsx", "json", "node"],
  };
  