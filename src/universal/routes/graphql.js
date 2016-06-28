export default {
  path: 'graphql',
  getComponent: async (location, cb) => {
    const component = await System.import('universal/modules/admin/containers/Graphql/Graphql');
    cb(null, component);
  }
};
