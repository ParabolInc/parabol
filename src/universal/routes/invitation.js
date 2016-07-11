export default {
  path: '/invitation/:id',
  getComponent: async(location, cb) => {
    const component = await System.import('universal/modules/invitation/containers/Invitation/Invitation');
    cb(null, component);
  }
};
