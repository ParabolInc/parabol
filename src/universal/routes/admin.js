export default ([
  {
    path: 'admin/graphql',
    getComponent: async (location, cb) => {
      const component = await System.import('universal/modules/admin/containers/Graphql/Graphql');
      cb(null, component.default);
    }
  },
  {
    path: 'admin/impersonate/:newUserId',
    getComponent: async (location, cb) => {
      const component = await System.import('universal/modules/admin/containers/Impersonate/Impersonate');
      cb(null, component.default);
    }
  }
]);
