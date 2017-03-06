import React, {Component, PropTypes} from 'react';
import {getAuthQueryString, getAuthedOptions} from 'universal/redux/getAuthedUser';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {unsetNextUrl} from 'universal/redux/authDuck';

const mapStateToProps = state => {
  const {auth} = state;
  return {
    auth,
    user: cashay.query(getAuthQueryString, getAuthedOptions(auth.obj.sub)).data.user
  };
};

export default (ComposedComponent) => {
  @connect(mapStateToProps)
  @withRouter
  class LoginWithToken extends Component {
    static propTypes = {
      auth: PropTypes.object,
      dispatch: PropTypes.func,
      router: PropTypes.object.isRequired
    };

    componentWillMount() {
      this.handleAuthChange(this.props);
    }
    componentWillReceiveProps(nextProps) {
      const {auth: {obj: {sub: prevSub}}} = this.props;
      const {auth: {obj: {sub: nextSub}}} = nextProps;
      if (prevSub !== nextSub) {
        this.handleAuthChange(nextProps);
      }
    }

    handleAuthChange(props) {
      const {auth, dispatch, router} = props;

      if (auth.obj.sub) {
        // note if you join a team & leave it, tms will be an empty array
        const isNew = !auth.obj.hasOwnProperty('tms');
        if (isNew) {
          router.push('/welcome');
        } else if (auth.nextUrl) {
          router.push(auth.nextUrl);
          dispatch(unsetNextUrl());
        } else {
          router.push('/me');
        }
      }
    }

    render() {
      return <ComposedComponent {...this.props}/>;
    }
  }
  return LoginWithToken;
};
