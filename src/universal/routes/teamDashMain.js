export default {
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
      {
        path: 'archive',
        getComponent: async (location, cb) => {
          const component = await System.import('universal/modules/teamDashboard/containers/TeamArchive/TeamArchiveContainer');
          cb(null, component);
        }
      },
      {
        path: 'settings',
        getComponent: async (location, cb) => {
          const component = await System.import('universal/modules/teamDashboard/containers/TeamSettings/TeamSettingsContainer');
          cb(null, component);
        }
      }
    ]);
  }
};
