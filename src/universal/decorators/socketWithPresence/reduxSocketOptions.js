import {cashay, Transport} from 'cashay';
import AuthEngine from 'universal/redux/AuthEngine';
import socketCluster from 'socketcluster-client';

const onConnect = (options, hocOptions, socket) => {
  const sendToServer = request => {
    return new Promise((resolve) => {
      socket.emit('graphql', request, (error, response) => {
        resolve(response);
      });
    });
  };
  const priorityTransport = new Transport(sendToServer);
  cashay.create({priorityTransport});
};
const onDisconnect = () => cashay.create({priorityTransport: null});
export default ({AuthEngine, socketCluster, onConnect, onDisconnect, keepAlive: 0});
