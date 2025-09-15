module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    },
    testPathIgnorePatterns: ['/node_modules/', '/build/'],
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "/build/",
        "/coverage/",
        "src/index.js",
        "src/reportWebVitals.js",
        "src/setupTests.js",
        "src/App.test.js",
        "src/components/ErrorBoundary.jsx",
        "src/components/FoxEasterEgg.jsx",
        "src/components/PlaceholderImages.jsx",
        "src/components/SakuraPetals.jsx",
        "src/components/ScrollToTop.jsx",
        "src/components/SEO.jsx",
        "src/components/SocialShare.jsx",
        "src/TestPage.jsx"
    ]
  };
