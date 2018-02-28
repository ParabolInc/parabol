/**
 * Sends the user to `/signin`, which is expected to route them based on their signed-in state.
 *
 * @flow
 */
import type {Location} from 'react-router-dom';

import React from 'react';
import {withRouter, Redirect} from 'react-router-dom';

type Props = {
  location: Location
};

const HomePage = ({location: {search}}: Props) => (
  <Redirect to={{pathname: '/signin', search}} />
);

export default withRouter(HomePage);
