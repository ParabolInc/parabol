import {APP_NAME} from './constants';

export const auth0 = {
  clientId: process.env.AUTH0_CLIENT_ID || 'w3mBrhiXGsE3DsrSMgpAz2bS6VzLhOyJ',
  domain: process.env.AUTH0_DOMAIN || 'parabol.auth0.com'
};

export const head = {
  titleTemplate: '%s | Parabol, Inc.',
  meta: [
    {name: 'description', content: 'Team transparency, made easy.'},
    {charset: 'utf-8'},
    {property: 'og:site_name', content: APP_NAME},
// {property: 'og:image', content: 'https://react-redux.herokuapp.com/logo.jpg'},
// {property: 'og:image:width', content: '200'},
// {property: 'og:image:height', content: '200'},
    {property: 'og:locale', content: 'en_US'},
    {property: 'og:title', content: APP_NAME},
    {property: 'og:description', content: 'Team transparency, made easy.'},
    {property: 'og:card', content: 'summary'},
    {property: 'og:site', content: '@jrhusney'},
    {property: 'og:creator', content: '@jrhusney'},
  ]
};

export const stripeKey = 'pk_test_MNoKbCzQX0lhktuxxI7M14wd';
