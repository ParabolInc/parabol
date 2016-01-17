require('babel/polyfill');

const nodeEnv = process.env.NODE_ENV || 'development';

const runtime = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[nodeEnv];

const environment = require('./env/' + nodeEnv);

module.exports = Object.assign({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT,
  apiHost: process.env.APIHOST || 'localhost',
  apiPort: process.env.APIPORT,
  app: {
    title: 'Action',
    description: 'Team transparency, made easy.',
    head: {
      titleTemplate: 'React Redux Example: %s',
      meta: [
        {name: 'description', content: 'Team transparency, made easy.'},
        {charset: 'utf-8'},
        {property: 'og:site_name', content: 'Action'},
        // {property: 'og:image', content: 'https://react-redux.herokuapp.com/logo.jpg'},
        // {property: 'og:image:width', content: '200'},
        // {property: 'og:image:height', content: '200'},
        {property: 'og:locale', content: 'en_US'},
        {property: 'og:title', content: 'Action'},
        {property: 'og:description', content: 'Team transparency, made easy.'},
        {property: 'og:card', content: 'summary'},
        {property: 'og:site', content: '@jrhusney'},
        {property: 'og:creator', content: '@jrhusney'},
      ]
    }
  },

}, runtime, environment);
