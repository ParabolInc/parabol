import Queue from 'server/utils/bull';

const integratron = Queue('integratron');

let channelNumber = -1;
const queryIntegrator = (actionAndPayload) => {
  channelNumber = channelNumber > 1e6 ? 0 : channelNumber + 1;
  const oneTimeId = `${process.pid}/${channelNumber}`;
  const oneTimeQueue = Queue(oneTimeId);
  return new Promise((resolve) => {
    oneTimeQueue.process((job) => {
      const {data} = job;
      resolve(data);
      oneTimeQueue.close()
    });
    integratron.add({
      ...actionAndPayload,
      queue: oneTimeId
    });
  })
};

export default queryIntegrator;
