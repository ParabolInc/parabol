// https://github.com/webpack/webpack/tree/master/examples/code-splitted-require.context
// There's a lot of boilerplate here, but if the require isn't static, then webpack can't chunk properly
import {requireNoAuth} from './requireNoAuth';

export default {
  path: 'signin/:action',
  getComponent: async(location, cb) => {
    const component = await System.import('universal/modules/meeting/containers/SigninSuccess/SigninSuccess');
    cb(null, component);
  }
};
