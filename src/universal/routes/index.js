/*
 * Setup webpack runtime public path loading, used for configuring
 * asset loading from our CDN:
 */
import getWebpackPublicPath from '../utils/getWebpackPublicPath';
__webpack_public_path__ = getWebpackPublicPath(); // eslint-disable-line

import ActionContainer from '../containers/Action/ActionContainer';
import _cashaySchema from 'cashay!server/utils/getCashaySchema.js';

/* eslint-disable global-require */
export default store => ({
  /*
   * setting a component above the '/' route allows for sharing a container across a landing page
   * as the index route and repeat that container for child routes
   */
  component: ActionContainer,
  childRoutes: [
    require('./graphql'),
    require('./invitation')(store),
    require('./landing'),
    require('./logout'),
    require('./meeting')(store),
    require('./newTeam')(store),
    // ...require('./meetingLayoutRoutes'),
    require('./patterns'),
    require('./summary')(store),
    require('./teamDashboard')(store),
    require('./userDashboard')(store),
    require('./welcome')(store),
    // Catch-all:
    require('./notFound')
  ]
});

// the server needs these things for SSR.
// In the future, we might combine routes + clients to do away with this
export {StyleSheetServer} from 'aphrodite-local-styles/no-important';
export const cashaySchema = _cashaySchema;
export {cashay} from 'cashay';
/* eslint-enable */
