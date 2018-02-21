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
  location: Location
};

const DynamicHome = (props: Props) => (
  props.hasSession ? (
    <Redirect to={{pathname: '/me', search: props.location.search}} />
  ) : (
    <Redirect to={{pathname: '/signin', search: props.location.search}} />
  )
);

const mapStateToProps = (state) => ({
  hasSession: Boolean(state.auth.obj.sub)
});

export default connect(mapStateToProps)(
  withRouter(DynamicHome)
);
