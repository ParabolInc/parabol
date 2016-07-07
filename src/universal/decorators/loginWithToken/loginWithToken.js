import React, {Component, PropTypes} from 'react';
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
// eslint-disable-next-line arrow-body-style
export default ComposedComponent => {
  @connect(mapStateToProps)
  class TokenizedComp extends Component {
    static propTypes = {
      dispatch: PropTypes.func,
      authToken: PropTypes.string,
      user: PropTypes.object
    };

    render() {
      const {dispatch, authToken, user} = this.props;

      if (authToken && user) {
        if (user.profile.isNew) {
          dispatch(push('/welcome'));
        } else if (user.profile.isNew === false) {
          dispatch(push('/me'));
        }
        return null;
      }
      return <ComposedComponent {...this.props}/>;
    }
  }
  return TokenizedComp;
};
