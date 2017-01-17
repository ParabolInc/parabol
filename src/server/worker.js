import express from 'express';
import webpack from 'webpack';
import compression from 'compression';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'express-jwt';
import favicon from 'serve-favicon';
import raven from 'raven';
import config from '../../webpack/webpack.config.dev';
import createSSR from './createSSR';
import emailSSR from './emailSSR';
import {clientSecret as secretKey} from './utils/auth0Helpers';
import {auth0} from 'universal/utils/clientOptions';
import scConnectionHandler from './socketHandlers/scConnectionHandler';
import httpGraphQLHandler from './graphql/httpGraphQLHandler';
import mwPresencePublishOut from './socketHandlers/mwPresencePublishOut';
import mwPresenceSubscribe from './socketHandlers/mwPresenceSubscribe';

const PROD = process.env.NODE_ENV === 'production';

export function run(worker) {
  console.log('   >> Worker PID:', process.pid);
  const app = express();
  const scServer = worker.scServer;
  const httpServer = worker.httpServer;
  httpServer.on('request', app);

  // HMR
  if (!PROD) {
    const compiler = webpack(config);
    /* eslint-disable global-require */
    app.use(require('webpack-dev-middleware')(compiler, {
      noInfo: false,
      publicPath: config.output.publicPath,
      stats: {
        chunks: false,
        colors: true
      }
    }));
    app.use(require('webpack-hot-middleware')(compiler));
    /* eslint-enable global-require */
  }

  // setup middleware
  app.use(
    // sentry.io request handler capture middleware:
    raven.middleware.express.requestHandler(process.env.SENTRY_DSN)
  );
  app.use(bodyParser.json());
  app.use(cors({origin: true, credentials: true}));
  app.use('/static', express.static('static'));
  app.use(favicon(`${__dirname}/../../static/favicon.ico`));
  if (PROD) {
    app.use(compression());
    app.use('/static', express.static('build'));
  }

  // HTTP GraphQL endpoint
  const graphQLHandler = httpGraphQLHandler(scServer.exchange);
  app.post('/graphql', jwt({
    secret: new Buffer(secretKey, 'base64'),
    audience: auth0.clientId,
    credentialsRequired: false
  }), graphQLHandler);

  // server-side rendering for emails
  if (!PROD) {
    app.get('/email', emailSSR);
  }
  // server-side rendering
  app.get('*', createSSR);

  // error handling middleware:
  app.use(
    // sentry.io:
    raven.middleware.express.errorHandler(process.env.SENTRY_DSN)
  );

  // handle sockets
  const {MIDDLEWARE_PUBLISH_OUT, MIDDLEWARE_SUBSCRIBE} = scServer;
  scServer.addMiddleware(MIDDLEWARE_PUBLISH_OUT, mwPresencePublishOut);
  scServer.addMiddleware(MIDDLEWARE_SUBSCRIBE, mwPresenceSubscribe);
  const connectionHandler = scConnectionHandler(scServer.exchange);
  scServer.on('connection', connectionHandler);
}
