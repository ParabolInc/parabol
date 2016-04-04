import {SocketCluster} from 'socketcluster';
import {auth0Secret} from './secrets';
import path from 'path';
// import os from 'os';

// const numCpus = os.cpus().length;
export const options = {
  authKey: new Buffer(auth0Secret, 'base64'),
  logLevel: 1,
  // change this to scale vertically
  workers: 1,
  brokers: 1,
  port: 3000,
  appName: 'Meatier',
  allowClientPublish: false,
  initController: path.join(__dirname, '/init.js'),
  workerController: path.join(__dirname, '/worker.js'),
  brokerController: path.join(__dirname, '/broker.js'),
  socketChannelLimit: 1000,
  rebootWorkerOnCrash: true
};
new SocketCluster(options); // eslint-disable-line no-new
