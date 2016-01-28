import express from 'express';
import expressSession from 'express-session';
import sessionRethinkDB from 'session-rethinkdb';
import bodyParser from 'body-parser';
import PrettyError from 'pretty-error';
import http from 'http';
import SocketIo from 'socket.io';
import socketSession from 'socket.io-express-session';
import falcorExpress from 'falcor-express';

import * as actions from './actions/index';
import config from '../config/config';
import { Database } from './models/index';
import FalcorRouter from './falcor/index';
import { onConnection } from './socketio/index';
import { mapUrl } from './utils/url';

const pretty = new PrettyError();

/*
 * Initialize app and HTTP server:
 */
const app = express();
const server = new http.Server(app);

/*
 * Initialize session store – common to both
 * HTTP and socket.io servers:
 */
const RDBStore = sessionRethinkDB(expressSession);
const rDBStore = new RDBStore(Database.r, {
  table: 'Session'
});
const session = expressSession({
  cookie: { maxAge: 86000 },
  key: 'sid',
  resave: false,
  saveUninitialized: true,
  secret: config.session.secret,
  store: rDBStore
});


const io = new SocketIo(server);
io.path('/ws');
io.use(socketSession(session));
app.set('io', io); // stash a handle to our socket.io instance

app.use(session);
app.use(bodyParser.json());

// Initialze falcor routes:
app.use('/model.json', bodyParser.urlencoded({extended: false}),
  falcorExpress.dataSourceRoute( (req, res, next) =>
    new FalcorRouter(req, res, next)
));

app.use(bodyParser.json(), (req, res) => {
  const splittedUrlPath = req.url.split('?')[0].split('/').slice(1);

  const {action, params} = mapUrl(actions, splittedUrlPath);

  if (action) {
    action(req, params)
      .then((result) => {
        if (result instanceof Function) {
          result(res);
        } else {
          res.json(result);
        }
      }, (reason) => {
        if (reason && reason.redirect) {
          res.redirect(reason.redirect);
        } else {
          console.error('API ERROR:', pretty.render(reason));
          res.status(reason.status || 500).json(reason);
        }
      });
  } else {
    res.status(404).end('NOT FOUND');
  }
});

if (config.apiPort) {
  const runnable = app.listen(config.apiPort, (err) => {
    if (err) {
      console.error(err);
    }
    console.info('----\n==> 🌎  API is running on port %s', config.apiPort);
    console.info('==> 💻  Send requests to http://%s:%s', config.apiHost, config.apiPort);
  });

  io.on('connection', (socket) => onConnection(io, socket));
  io.listen(runnable);
} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
