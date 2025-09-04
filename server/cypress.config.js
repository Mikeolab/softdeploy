const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    chromeWebSecurity: false,
    experimentalStudio: true,
    experimentalModifyObstructiveThirdPartyCode: true
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    }
  }
})

