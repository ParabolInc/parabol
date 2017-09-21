import channelsToSerialize from 'server/__tests__/utils/channelsToSerialize';

export default class MockPubSub {
  constructor() {
    this.db = {};
  }

  __serialize(dynamicSerializer) {
    const channels = Object.keys(this.db);
    const snapshot = {};
    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i];
      const doc = this.db[channel];
      if (!channelsToSerialize[channel]) {
        throw new Error(`BAD MOCK: No channelsToSerialize for DB table ${channel}`);
      }
      snapshot[channel] = dynamicSerializer.toStatic(doc, channelsToSerialize[channel]);
      // we don't care about the order, so make it repeatable
      snapshot[channel].sort((a, b) => a.channelId < b.channelId ? 1 : -1);
    }
    return snapshot;
  }

  publish(channel, message) {
    const [channelName, channelId] = channel.split('.');
    this.db[channelName] = this.db[channelName] || [];
    this.db[channelName].push({channelId, message});
  }
}

