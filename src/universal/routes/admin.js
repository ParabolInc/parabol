export default {
  path: 'admin/impersonate/:newUserId',
  getComponent: async (location, cb) => {
    const component = await System.import('universal/modules/admin/containers/Impersonate/Impersonate');
    cb(null, component);
  }
};
