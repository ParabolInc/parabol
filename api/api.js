import express from 'express';
import session from 'express-session';
import sessionRethinkDB from 'session-rethinkdb';
import bodyParser from 'body-parser';
import PrettyError from 'pretty-error';
import http from 'http';
import SocketIo from 'socket.io';
import falcorExpress from 'falcor-express';

import * as actions from './actions/index';
import config from '../config/config';
import { Database } from './models/index';
import FalcorRoutes from './falcor/index';
import { mapUrl } from './utils/url';

const pretty = new PrettyError();
const app = express();

const server = new http.Server(app);

const io = new SocketIo(server);
io.path('/ws');

const RDBStore = sessionRethinkDB(session);
const rDBStore = new RDBStore(Database.r, {
  table: 'Session'
});

app.use(session({
  cookie: { maxAge: 86000 },
  key: 'sid',
  resave: false,
  saveUninitialized: true,
  secret: config.session.secret,
  store: rDBStore
}));

app.use(bodyParser.json());

// Initialze falcor routes:
app.use('/model.json', bodyParser.urlencoded({extended: false}),
  falcorExpress.dataSourceRoute( () => new FalcorRoutes() ));

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

const bufferSize = 100;
const messageBuffer = new Array(bufferSize);
let messageIndex = 0;

if (config.apiPort) {
  const runnable = app.listen(config.apiPort, (err) => {
    if (err) {
      console.error(err);
    }
    console.info('----\n==> 🌎  API is running on port %s', config.apiPort);
    console.info('==> 💻  Send requests to http://%s:%s', config.apiHost, config.apiPort);
  });

  io.on('connection', (socket) => {
    socket.emit('news', {msg: `'Hello World!' from server`});

    socket.on('history', () => {
      for (let index = 0; index < bufferSize; index++) {
        const msgNo = (messageIndex + index) % bufferSize;
        const msg = messageBuffer[msgNo];
        if (msg) {
          socket.emit('msg', msg);
        }
      }
    });

    socket.on('msg', (data) => {
      data.id = messageIndex;
      messageBuffer[messageIndex % bufferSize] = data;
      messageIndex++;
      io.emit('msg', data);
    });
  });
  io.listen(runnable);
} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
