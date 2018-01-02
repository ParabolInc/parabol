import getPubSub from 'server/utils/getPubSub';

const publish = (topic, channel, type, data, subOptions) => {
  getPubSub().publish(`${topic}.${channel}`, {data: {type, ...data}, ...subOptions});
};

export default publish;
