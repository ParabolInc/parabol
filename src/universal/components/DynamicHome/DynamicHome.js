/**
 * Detects the user to their appropriate "home", depending on whether
 * they're authenticated or not.
 *
 * @flow
 */
import type {Location} from 'react-router-dom';

import React from 'react';
import {withRouter, Redirect} from 'react-router-dom';

import loginWithToken from 'universal/decorators/loginWithToken/loginWithToken';

type Props = {
  location: Location
};

const DynamicHome = ({location: {search}}: Props) => (
  <Redirect to={{pathname: '/signin', search}} />
);

export default loginWithToken(
  withRouter(DynamicHome)
);
