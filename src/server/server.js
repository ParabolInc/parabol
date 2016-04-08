import {SocketCluster} from 'socketcluster';
import path from 'path';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
// import os from 'os';

// Import .env and expand variables:
try {
  const myEnv = dotenv.config({silent: true});
  dotenvExpand(myEnv);
} catch (e) {
  console.warn(`Unable to load .env: ${e}`);
}

// const numCpus = os.cpus().length;
export const options = {
  authKey: process.env.AUTH0_CLIENT_SECRET ?
    new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64') :
    new Buffer('BksPeQQrRkXhDrugzQDg5Nw-IInub9RkQ-pSWohUM9s6Oii4xoGVCrK2_OcUCfYZ', 'base64'),
  logLevel: 1,
  // change this to scale vertically
  workers: 1,
  brokers: 1,
  host: process.env.HOST || '127.0.0.1',
  port: process.env.PORT || 3000,
  appName: 'Meatier',
  allowClientPublish: false,
  initController: path.join(__dirname, '/init.js'),
  workerController: path.join(__dirname, '/worker.js'),
  brokerController: path.join(__dirname, '/broker.js'),
  socketChannelLimit: 1000,
  rebootWorkerOnCrash: true,
};
new SocketCluster(options); // eslint-disable-line no-new
