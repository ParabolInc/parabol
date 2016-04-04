// import Home from 'universal/modules/landing/components/Home/Home';
import LandingContainer from 'universal/modules/landing/containers/Landing/LandingContainer';
import Landing from 'universal/modules/landing/components/Landing/Landing';

export default {
  path: '/',
  component: LandingContainer,
  indexRoute: {
    component: Landing
  }
  // childRoutes: []
};
