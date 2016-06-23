import React, {Component, PropTypes} from 'react';
import Me from 'universal/modules/userDashboard/components/Me/Me';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';

@requireAuth
// eslint-disable-next-line react/prefer-stateless-function
export default class MeContainer extends Component {
  render() {
    const {user} = this.props.auth;
    return <Me user={user}/>;
  }
}
