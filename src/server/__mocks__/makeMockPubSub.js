const makeMockPubSub = () => ({
  publish: jest.fn(),
  subscribe: jest.fn()
});

export default makeMockPubSub;
