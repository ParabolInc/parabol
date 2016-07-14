import React, {PropTypes} from 'react';
import Landing from 'universal/modules/landing/components/Landing/Landing';
import Helmet from 'react-helmet';
import {showLock} from 'universal/components/Auth0ShowLock/Auth0ShowLock';
import {head} from 'universal/utils/clientOptions';
import loginWithToken from 'universal/decorators/loginWithToken/loginWithToken';


const LandingContainer = (props) => {
  const {dispatch} = props;
  return (
    <div>
      <Helmet title="Welcome to Action" {...head} />
      <Landing onMeetingCreateClick={() => showLock(dispatch)} {...props} />
    </div>
  );
};

LandingContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  authToken: PropTypes.string,
  user: PropTypes.object
};

export default loginWithToken(LandingContainer);
