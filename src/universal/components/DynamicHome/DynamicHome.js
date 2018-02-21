/**
 * Detects the user to their appropriate "home", depending on whether
 * they're authenticated or not.
 *
 * @flow
 */

import React from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';

type Props = {
  hasSession: boolean
};

const DynamicHome = ({hasSession}: Props) => (
  hasSession
    ? <Redirect to="/me" />
    : <Redirect to="/signin" />
);

const mapStateToProps = (state): Props => ({
  hasSession: Boolean(state.auth.obj.sub)
});

export default connect(mapStateToProps)(DynamicHome);
