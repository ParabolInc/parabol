export default {
  path: '/team/:teamId/archive',
  getComponent: async(location, cb) => {
    const component = await System.import('universal/modules/teamDashboard/');
    cb(null, component);
  }
};
