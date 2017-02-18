import {SocketCluster} from 'socketcluster';
import path from 'path'; // path must stay relative since this is before all babelfication
import {clientSecret as secretKey} from './utils/auth0Helpers';
import {JWT_LIFESPAN} from './utils/serverConstants';

// const numCpus = os.cpus().length;
export const options = {
  authDefaultExpiry: JWT_LIFESPAN,
  authKey: new Buffer(secretKey, 'base64'),
  logLevel: 1,
  // socket engine written in C++? don't mind if i do!
  wsEngine: 'uws',
  // change this to scale vertically
  workers: 1,
  brokers: 1,
  port: process.env.PORT || 3000,
  appName: 'Action',
  // keep this false so peers can't send a KICK_OUT message
  allowClientPublish: false,
  initController: path.join(__dirname, '/init.js'),
  workerController: path.join(__dirname, '/worker.js'),
  brokerController: path.join(__dirname, '/broker.js'),
  socketChannelLimit: 1000,
  rebootWorkerOnCrash: true
};
const server = new SocketCluster(options); // eslint-disable-line no-new

export default server;
