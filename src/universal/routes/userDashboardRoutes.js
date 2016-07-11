export default [
  {
    path: '/me',
    getComponent: async(location, cb) => {
      const component = await System.import('universal/modules/userDashboard/containers/Me/Me');
      cb(null, component);
    }
  },
  {
    path: '/me/settings',
    getComponent: async(location, cb) => {
      const component = await System.import('universal/modules/userDashboard/containers/MeSettings/MeSettings');
      cb(null, component);
    },
  }
];
