import AppContainer from 'universal/containers/App/AppContainer';

/* eslint-disable global-require */
export default store => ({
  /*
   * setting a component above the '/' route allows for sharing a container across a landing page
   * as the index route and repeat that container for child routes
   */
  component: AppContainer,
  childRoutes: [
    require('./landing'),
    require('./welcome'),
    require('./userDashboard'),
    require('./signin'),
    require('./meeting')(store),
    require('./graphql'),
    require('./patterns'),
    require('./notFound')
  ]
});
/* eslint-enable */
