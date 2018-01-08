import getPubSub from 'server/utils/getPubSub';

const publish = (topic, channel, type, payload, subOptions) => {
  const data = {
    ...payload,
    type
  };

  getPubSub().publish(`${topic}.${channel}`, {data, ...subOptions});
};

export default publish;
