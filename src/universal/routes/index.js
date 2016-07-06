import ActionContainer from '../containers/Action/ActionContainer';

/* eslint-disable global-require */
export default store => ({
  /*
   * setting a component above the '/' route allows for sharing a container across a landing page
   * as the index route and repeat that container for child routes
   */
  component: ActionContainer,
  childRoutes: [
    require('./teamDashboard')(store),
    require('./landing'),
    require('./welcome')(store),
    require('./userDashboard')(store),
    require('./meeting')(store),
    require('./graphql'),
    require('./patterns'),
    require('./notFound')
  ]
});
/* eslint-enable */
