import React, {PropTypes} from 'react';
import {getAuthQueryString, getAuthedOptions} from 'universal/redux/getAuthedUser';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {unsetNextUrl} from 'universal/redux/authDuck';

const mapStateToProps = state => {
  const auth = state.auth.obj;
  return {
    auth: state.auth.obj,
    user: cashay.query(getAuthQueryString, getAuthedOptions(auth.sub)).data.user
  };
};

export default ComposedComponent => {
  const TokenizedComp = (props) => {
    const {auth, dispatch, router} = props;
    if (auth.sub) {
      // note if you join a team & leave it, tms will be an empty array
      const isNew = !auth.hasOwnProperty('tms');
      if (isNew) {
        router.push('/welcome');
      } else if (auth.nextUrl) {
        router.push(auth.nextUrl);
        dispatch(unsetNextUrl());
      } else {
        router.push('/me');
      }
    }
    return <ComposedComponent {...props}/>;
  };

  TokenizedComp.propTypes = {
    auth: PropTypes.object,
    dispatch: PropTypes.object,
    router: PropTypes.object.isRequired
  };

  return connect(mapStateToProps)(withRouter(TokenizedComp));
};
