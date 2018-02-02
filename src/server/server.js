import express from 'express';
import webpack from 'webpack'; // eslint-disable-line import/no-extraneous-dependencies
import compression from 'compression';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'express-jwt';
import favicon from 'serve-favicon';
import raven from 'raven';
import createSSR from './createSSR';
import emailSSR from './emailSSR';
import {clientSecret as secretKey} from './utils/auth0Helpers';
import connectionHandler from './socketHandlers/wssConnectionHandler';
import httpGraphQLHandler, {intranetHttpGraphQLHandler} from './graphql/httpGraphQLHandler';
import stripeWebhookHandler from './billing/stripeWebhookHandler';
import getDotenv from '../universal/utils/dotenv';
import handleIntegration from './integrations/handleIntegration';
import sendICS from './sendICS';
import './polyfills';
import {GITHUB, SLACK} from '../universal/utils/constants';
import handleGitHubWebhooks from 'server/integrations/handleGitHubWebhooks';
import SharedDataLoader from 'shared-dataloader';
import {Server} from 'uws';
import http from 'http';

// Import .env and expand variables:
getDotenv();

const PROD = process.env.NODE_ENV === 'production';
const INTRANET_JWT_SECRET = process.env.INTRANET_JWT_SECRET || '';


const app = express();
const server = http.createServer(app);
const wss = new Server({server});
server.listen(3000);
// This houses a per-mutation dataloader. When GraphQL is its own microservice, we can move this there.
const sharedDataLoader = new SharedDataLoader({PROD, onShare: '_share', ttl: 5000});

// HMR
if (!PROD) {
  const config = require('../../webpack/webpack.config.dev').default;
  const compiler = webpack(config);
  /* eslint-disable global-require */
  app.use(require('webpack-dev-middleware')(compiler, { // eslint-disable-line import/no-extraneous-dependencies
    noInfo: false,
    publicPath: config.output.publicPath,
    stats: {
      chunks: false,
      colors: true
    },
    watchOptions: {
      poll: true,
      aggregateTimeout: 300
    }
  }));
  app.use(require('webpack-hot-middleware')(compiler)); // eslint-disable-line import/no-extraneous-dependencies
  /* eslint-enable global-require */
}

// setup middleware
// sentry.io request handler capture middleware, must be first:
app.use(raven.requestHandler(process.env.SENTRY_DSN));
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    if (req.originalUrl.startsWith('/stripe')) {
      req.rawBody = buf.toString();
    }
  }
}));

app.use(cors({origin: true, credentials: true}));
app.use('/static', express.static('static'));
app.use(favicon(`${__dirname}/../../static/favicon.ico`));
app.use('/static', express.static('build'));
if (PROD) {
  app.use(compression());
}

// HTTP GraphQL endpoint
const graphQLHandler = httpGraphQLHandler(sharedDataLoader);
app.post('/graphql', jwt({
  secret: new Buffer(secretKey, 'base64'),
  audience: process.env.AUTH0_CLIENT_ID,
  credentialsRequired: false
}), graphQLHandler);

// HTTP Intranet GraphQL endpoint:
app.post('/intranet-graphql', jwt({
  secret: new Buffer(INTRANET_JWT_SECRET, 'base64'),
  credentialsRequired: true
}), intranetHttpGraphQLHandler);

// server-side rendering for emails
if (!PROD) {
  app.get('/email', emailSSR);
}
app.get('/email/createics', sendICS);

// stripe webhooks
app.post('/stripe', stripeWebhookHandler(sharedDataLoader));

app.get('/auth/github', handleIntegration(GITHUB));
app.get('/auth/slack', handleIntegration(SLACK));
app.post('/webhooks/github', handleGitHubWebhooks);

// server-side rendering
app.get('*', createSSR);

// sentry.io global exception error handling middleware:
// app.use(raven.middleware.express.errorHandler(process.env.SENTRY_DSN));

// handle sockets
wss.on('connection', connectionHandler(sharedDataLoader));
