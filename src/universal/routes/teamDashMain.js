export default (store) => ({
  path: ':teamId',
  getComponent: async(location, cb) => {
    const component = await System.import('universal/modules/teamDashboard/containers/Team/TeamContainer');
    cb(null, component);
  },
  getIndexRoute: async (location, cb) => {
    const component = await System.import('universal/modules/teamDashboard/components/AgendaAndProjects/AgendaAndProjects');
    cb(null, {component});
  },
  getChildRoutes: (childLocation, cbChild) => {
    cbChild(null, [
      require('./teamArchive')(store),
      require('./teamSettings')(store)
    ]);
  }
});
