export default {
  path: '/welcome',
  getComponent: async(location, cb) => {
    const component = await System.import(
      'universal/modules/welcome/containers/WelcomeUser/WelcomeUser');
    cb(null, component);
  }
};
