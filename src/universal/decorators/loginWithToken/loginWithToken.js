import React, {PropTypes} from 'react';
import {push} from 'react-router-redux';
import {getAuthQueryString, authedOptions} from 'universal/redux/getAuthedUser';
import {cashay} from 'cashay';
import {connect} from 'react-redux';

const mapStateToProps = state => {
  return {
    authToken: state.authToken,
    user: cashay.query(getAuthQueryString, authedOptions).data.user
  };
};

export default ComposedComponent => {
  const TokenizedComp = (props) => {
    const {dispatch, authToken, user} = props;
    if (authToken && user) {
      if (user.isNew === true) {
        dispatch(push('/welcome'));
      } else if (user.isNew === false) {
        dispatch(push('/me'));
      }
    }
    return <ComposedComponent {...props}/>;
  };

  TokenizedComp.propTypes = {
    dispatch: PropTypes.func,
    authToken: PropTypes.string,
    user: PropTypes.shape({
      email: PropTypes.string,
      id: PropTypes.string,
      isNew: PropTypes.bool,
      picture: PropTypes.string,
      preferredName: PropTypes.string
    })
  };

  return connect(mapStateToProps)(TokenizedComp);
};
