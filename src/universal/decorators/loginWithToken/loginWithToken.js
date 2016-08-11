import React, {PropTypes} from 'react';
import {getAuthQueryString, authedOptions} from 'universal/redux/getAuthedUser';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

const mapStateToProps = state => {
  return {
    authToken: state.authToken,
    user: cashay.query(getAuthQueryString, authedOptions).data.user
  };
};

export default ComposedComponent => {
  const TokenizedComp = (props) => {
    const {authToken, user, router} = props;
    if (authToken && user) {
      // note if you join a team & leave it, tms will be an empty array
      const isNew = !authToken.hasOwnProperty('tms');
      if (isNew) {
        router.push('/welcome');
      } else {
        router.push('/me');
      }
    }
    return <ComposedComponent {...props}/>;
  };

  TokenizedComp.propTypes = {
    authToken: PropTypes.string,
    user: PropTypes.shape({
      email: PropTypes.string,
      id: PropTypes.string,
      picture: PropTypes.string,
      preferredName: PropTypes.string
    }),
    router: PropTypes.object.isRequired
  };

  return connect(mapStateToProps)(withRouter(TokenizedComp));
};
