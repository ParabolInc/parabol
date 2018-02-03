class SubscriptionClient {
  onDisconnected = jest.fn();
  onReconnected = jest.fn();
  onConnected = jest.fn();

  constructor() {
    this.client = {
      onerror: jest.fn()
    };
    this.operations = {};
    this.request = jest.fn(() => ({
      subscribe: jest.fn()
    }));
  }

}

export default SubscriptionClient;
