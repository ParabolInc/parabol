
export default [
  {
    route: 'greeting',
    get: () => {
      return { path: ['greeting'], value: 'Hello World' };
    }
  }
];
