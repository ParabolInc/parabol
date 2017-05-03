export default ([
  {
    path: 'admin/graphql',
    getComponent: async (location, cb) => {
      const component = await System.import('GraphqlContainer.js');
      cb(null, component.default);
    }
  },
  {
    path: 'admin/impersonate/:newUserId',
    getComponent: async (location, cb) => {
      const component = await System.import('ImpersonateContainer.js');
      cb(null, component.default);
    }
  }
]);
