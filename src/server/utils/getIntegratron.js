import Queue from 'server/utils/bull';

let integratron;
export default () => {
  if (!integratron) {
    integratron = Queue('integratron');
  }
  return integratron;
};
