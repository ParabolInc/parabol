/**
 * Detects the user to their appropriate "home", depending on whether
 * they're authenticated or not.
 *
 * @flow
 */
import type {Location} from 'react-router-dom';

import React from 'react';
import {connect} from 'react-redux';
import {Redirect, withRouter} from 'react-router-dom';

type Props = {
  hasSession: boolean,
  isNew: boolean,
  location: Location
};

const DynamicHome = ({hasSession, isNew, location: {search}}: Props) => {
  if (hasSession && isNew) {
    return <Redirect to={{pathname: '/welcome', search}} />;
  }
  if (hasSession) {
    return <Redirect to={{pathname: '/me', search}} />;
  }
  return <Redirect to={{pathname: '/signin', search}} />;
};

const mapStateToProps = (state) => {
  console.log(state.auth);
  return {
    hasSession: Boolean(state.auth.obj.sub),
    isNew: !state.auth.obj.hasOwnProperty('tms')
  };
};

export default connect(mapStateToProps)(
  withRouter(DynamicHome)
);
