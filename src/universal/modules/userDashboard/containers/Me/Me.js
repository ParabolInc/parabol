import React, {Component, PropTypes} from 'react';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';


// eslint-disable-next-line react/prefer-stateless-function
@requireAuth
export default class Me extends Component {
  render() {
    const {user} = this.props.auth;
    return <Me user={user}/>;
  }
}
