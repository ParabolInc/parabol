import Queue from 'server/utils/bull';
import getIntegratron from './getIntegratron';

let channelNumber = -1;
const queryIntegrator = (actionAndPayload) => {
  channelNumber = channelNumber > 1e6 ? 0 : channelNumber + 1;
  const oneTimeId = `${process.pid}/${channelNumber}`;
  const oneTimeQueue = Queue(oneTimeId);
  if (oneTimeQueue === null) return undefined;
  return new Promise((resolve) => {
    oneTimeQueue.on('completed', () => {
      oneTimeQueue.close();
    });
    oneTimeQueue.process((job) => {
      const {data} = job;
      resolve(data);
    });
    const integratron = getIntegratron();
    integratron.add({
      ...actionAndPayload,
      queue: oneTimeId
    });
  });
};

export default queryIntegrator;
