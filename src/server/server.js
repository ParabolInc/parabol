import {SocketCluster} from 'socketcluster';
import path from 'path';
import { getDotenv } from '../universal/utils/dotenv';

// Import .env and expand variables:
getDotenv();

const secretKey = process.env.AUTH0_CLIENT_SECRET ||
  'BksPeQQrRkXhDrugzQDg5Nw-IInub9RkQ-pSWohUM9s6Oii4xoGVCrK2_OcUCfYZ';

// const numCpus = os.cpus().length;
export const options = {
  authKey: new Buffer(secretKey, 'base64'),
  logLevel: 1,
  // change this to scale vertically
  workers: 1,
  brokers: 1,
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
