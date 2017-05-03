import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {unsetNextUrl} from 'universal/redux/authDuck';

const mapStateToProps = (state) => {
  const {auth} = state;
  return {
    auth
  };
};

const handleAuthChange = (props) => {
  const {auth, dispatch, history} = props;

  if (auth.obj.sub) {
    // note if you join a team & leave it, tms will be an empty array
    const isNew = !auth.obj.hasOwnProperty('tms');
    if (isNew) {
      history.push('/welcome');
    } else if (auth.nextUrl) {
      history.push(auth.nextUrl);
      dispatch(unsetNextUrl());
    } else {
      history.push('/me');
    }
  }
};

export default (ComposedComponent) => {
  @connect(mapStateToProps)
  @withRouter
  class LoginWithToken extends Component {
    static propTypes = {
      auth: PropTypes.object,
      dispatch: PropTypes.func,
      history: PropTypes.object.isRequired
    };

    componentWillMount() {
      handleAuthChange(this.props);
    }
    componentWillReceiveProps(nextProps) {
      const {auth: {obj: {sub: prevSub}}} = this.props;
      const {auth: {obj: {sub: nextSub}}} = nextProps;
      if (prevSub !== nextSub) {
        handleAuthChange(nextProps);
      }
    }

    render() {
      return <ComposedComponent {...this.props} />;
    }
  }
  return LoginWithToken;
};
