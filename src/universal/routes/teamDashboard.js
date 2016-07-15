export default {
  path: '/team/:meetingId',
  getComponent: async(location, cb) => {
    const component = await System.import('universal/modules/teamDashboard/containers/Team/Team');
    cb(null, component);
  }
};
