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
import {auth0} from 'universal/utils/clientOptions';
import scConnectionHandler from './socketHandlers/scConnectionHandler';
import httpGraphQLHandler, {intranetHttpGraphQLHandler} from './graphql/httpGraphQLHandler';
import mwPresencePublishOut from './socketHandlers/mwPresencePublishOut';
import mwMemoPublishOut from './socketHandlers/mwMemoPublishOut';
import mwPresenceSubscribe from './socketHandlers/mwPresenceSubscribe';
import mwMemoSubscribe from './socketHandlers/mwMemoSubscribe';
import stripeWebhookHandler from './billing/stripeWebhookHandler';
import getDotenv from '../universal/utils/dotenv';

// Import .env and expand variables:
getDotenv();

const PROD = process.env.NODE_ENV === 'production';
const INTRANET_JWT_SECRET = process.env.INTRANET_JWT_SECRET || '';

export function run(worker) { // eslint-disable-line import/prefer-default-export
  console.log('   >> Worker PID:', process.pid);
  const app = express();
  const scServer = worker.scServer;
  const httpServer = worker.httpServer;
  httpServer.on('request', app);

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
      }
    }));
    app.use(require('webpack-hot-middleware')(compiler)); // eslint-disable-line import/no-extraneous-dependencies
    /* eslint-enable global-require */
  }

  // setup middleware
  // sentry.io request handler capture middleware, must be first:
  app.use(raven.requestHandler(process.env.SENTRY_DSN));
  app.use(bodyParser.json());
  app.use(cors({origin: true, credentials: true}));
  app.use('/static', express.static('static'));
  app.use(favicon(`${__dirname}/../../static/favicon.ico`));
  app.use('/static', express.static('build'));
  if (PROD) {
    app.use(compression());
  }

  // HTTP GraphQL endpoint
  const graphQLHandler = httpGraphQLHandler(scServer.exchange);
  app.post('/graphql', jwt({
    secret: new Buffer(secretKey, 'base64'),
    audience: auth0.clientId,
    credentialsRequired: false
  }), graphQLHandler);

  // HTTP Intranet GraphQL endpoint:
  const intranetGraphQLHandler = intranetHttpGraphQLHandler(scServer.exchange);
  app.post('/intranet-graphql', jwt({
    secret: new Buffer(INTRANET_JWT_SECRET, 'base64'),
    credentialsRequired: true
  }), intranetGraphQLHandler);

  // server-side rendering for emails
  if (!PROD) {
    app.get('/email', emailSSR);
  }

  // stripe webhooks
  const stripeHandler = stripeWebhookHandler(scServer.exchange);
  app.post('/stripe', stripeHandler);

  // server-side rendering
  app.get('*', createSSR);

  // sentry.io global exception error handling middleware:
  // app.use(raven.middleware.express.errorHandler(process.env.SENTRY_DSN));

  // handle sockets
  const {MIDDLEWARE_PUBLISH_OUT, MIDDLEWARE_SUBSCRIBE} = scServer;
  scServer.addMiddleware(MIDDLEWARE_PUBLISH_OUT, mwPresencePublishOut);
  scServer.addMiddleware(MIDDLEWARE_PUBLISH_OUT, mwMemoPublishOut);
  scServer.addMiddleware(MIDDLEWARE_SUBSCRIBE, mwPresenceSubscribe);
  scServer.addMiddleware(MIDDLEWARE_SUBSCRIBE, mwMemoSubscribe);
  const connectionHandler = scConnectionHandler(scServer.exchange);
  scServer.on('connection', connectionHandler);
}
