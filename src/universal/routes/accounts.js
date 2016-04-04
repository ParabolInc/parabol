import LandingContainer from '../modules/landing/containers/Landing/LandingContainer';

export default function (store) {
  return {
    component: LandingContainer,
    childRoutes: [
      require('./signin')(store),
      require('./signup'),
      require('./logout'),
      require('./verifyEmail')
    ]
  };
}
