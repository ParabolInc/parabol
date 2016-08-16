import React, {PropTypes} from 'react';
import Landing from 'universal/modules/landing/components/Landing/Landing';
import Helmet from 'react-helmet';
import {showLock} from 'universal/components/Auth0ShowLock/Auth0ShowLock';
import {head} from 'universal/utils/clientOptions';
import loginWithToken from 'universal/decorators/loginWithToken/loginWithToken';


const LandingContainer = (props) => {
  const {dispatch} = props;
  const showLockThunk = () => showLock(dispatch);
  return (
    <div>
      <Helmet title="Welcome to Action" {...head} />
      <Landing handleLoginClick={showLockThunk} {...props} />
    </div>
  );
};

LandingContainer.propTypes = {
  auth: PropTypes.object,
  user: PropTypes.shape({
    email: PropTypes.string,
    id: PropTypes.string,
    picture: PropTypes.string,
    preferredName: PropTypes.string
  }),
  dispatch: PropTypes.func.isRequired,
};

export default loginWithToken(LandingContainer);
