// https://github.com/webpack/webpack/tree/master/examples/code-splitted-require.context
// There's a lot of boilerplate here, but if the require isn't static, then webpack can't chunk properly

export default {
  path: 'applayout',
  getComponent: async(location, cb) => {
    const component = await System.import('universal/containers/AppLayout/AppLayout');
    cb(null, component);
  }
};
