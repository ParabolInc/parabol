import ActionContainer from '../containers/Action/ActionContainer';
import _cashaySchema from 'cashay!server/utils/getCashaySchema.js'; // eslint-disable-line

/* eslint-disable global-require */
export default (store) => ({
  /*
   * setting a component above the '/' route allows for sharing a container across a landing page
   * as the index route and repeat that container for child routes
   */
  component: ActionContainer,
  childRoutes: [
    ...require('./admin').default,
    require('./invitation').default(store),
    require('./invoice').default(store),
    require('./landing').default,
    require('./signout').default,
    require('./meeting').default(store),
    require('./newTeam').default(store),
    require('./patterns').default,
    require('./summary').default(store),
    require('./teamDashboard').default(store),
    require('./userDashboard').default(store),
    require('./welcome').default(store),
    // Catch-all:
    require('./notFound').default
  ]
});

// the server needs these things for SSR.
// In the future, we might combine routes + clients to do away with this
export {StyleSheetServer} from 'aphrodite-local-styles/no-important';
export const cashaySchema = _cashaySchema;
export {cashay} from 'cashay';
/* eslint-enable */
