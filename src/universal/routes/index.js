import ActionContainer from '../containers/Action/ActionContainer';

/* eslint-disable global-require */
export default store => ({
  /*
   * setting a component above the '/' route allows for sharing a container across a landing page
   * as the index route and repeat that container for child routes
   */
  component: ActionContainer,
  childRoutes: [
    // require('./graphql'),
    // require('./invitation')(store),
    // require('./landing'),
    // require('./logout'),
    // require('./meeting')(store),
    // ...require('./meetingLayoutRoutes'),
    // require('./patterns'),
    // require('./teamDashboard')(store),
    // require('./userDashboard')(store),
    // require('./welcome')(store),
    // Catch-all:
    require('./notFound')
  ]
});
export {StyleSheetServer} from 'aphrodite';
export {cashay} from 'cashay';
export const cashaySchema = require('cashay!server/utils/getCashaySchema.js?stopRethink');
/* eslint-enable */
