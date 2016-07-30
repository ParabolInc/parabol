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
      if (user.isNew === true) {
        router.push('/welcome');
      } else if (user.isNew === false) {
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
      isNew: PropTypes.bool,
      picture: PropTypes.string,
      preferredName: PropTypes.string
    }),
    router: PropTypes.object.isRequired
  };

  return connect(mapStateToProps)(withRouter(TokenizedComp));
};
