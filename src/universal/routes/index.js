import AppContainer from 'universal/containers/App/AppContainer';

export default store => {
  return {
    /*
     * setting a component above the '/' route allows for sharing a container across a landing page
     * as the index route and repeat that container for child routes
     */
    component: AppContainer,
    childRoutes: [
      require('./landing'),
      require('./signin'),
      require('./meeting')(store),
      require('./graphql'),
      require('./notFound')
    ]
  };
};
