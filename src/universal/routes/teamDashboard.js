export default {
  path: '/team/:teamId',
  getComponent: async(location, cb) => {
    const component = await System.import('universal/modules/teamDashboard/containers/Team/Team');
    cb(null, component);
  }
};
