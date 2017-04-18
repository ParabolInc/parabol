import Queue from 'server/utils/bull';

const integratron = Queue('integratron');

let channelNumber = -1;
const queryIntegrator = (actionAndPayload) => {
  channelNumber = channelNumber > 1e6 ? 0 : channelNumber + 1;
  const oneTimeId = `${process.pid}/${channelNumber}`;
  return new Promise((resolve) => {
    const oneTimeQueue = Queue(oneTimeId);
    oneTimeQueue.on('completed', () => {
      setTimeout(() => {
        oneTimeQueue.close();
      }, 100);
    });
    oneTimeQueue.process((job) => {
      const {data} = job;
      resolve(data);
    });
    integratron.add({
      ...actionAndPayload,
      queue: oneTimeId
    });
  });
};

export default queryIntegrator;
