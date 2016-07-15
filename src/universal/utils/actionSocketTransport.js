import {Transport} from 'cashay';
import socket from 'universal/utils/socketDriver';

const sendToServer = request => {
  return new Promise((resolve) => {
    socket.emit('graphql', request, response => {
      resolve(response);
    });
  });
};

export default new Transport(sendToServer);
