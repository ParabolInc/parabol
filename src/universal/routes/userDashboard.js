export default () => ({
  path: '/me',
  getComponent: async(location, cb) => {
    const component = await System.import('universal/modules/userDashboard/containers/Me/Me');
    cb(null, component);
  },
  childRoutes: [
    {
      path: '/me/settings'
    }
  ]
});
