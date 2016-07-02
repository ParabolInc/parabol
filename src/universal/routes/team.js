export default () => ({
  path: '/team/:id',
  getComponent: async(location, cb) => {
    const component = await System.import('universal/modules/team/containers/TeamDashboard/TeamDashboard');
    cb(null, component);
  }
});
