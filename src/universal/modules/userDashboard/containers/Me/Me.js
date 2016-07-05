import React, {Component, PropTypes} from 'react';
import Me from 'universal/modules/userDashboard/components/Me/Me';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {connect} from 'react-redux';

const mapStateToProps = state => ({
  authToken: state.authToken
});

@connect(mapStateToProps)
@requireAuth
// eslint-disable-next-line react/prefer-stateless-function
export default class MeContainer extends Component {
  static propTypes = {
    user: PropTypes.object
  };

  render() {
    const {user} = this.props;
    console.log(user);
    return <Me user={user}/>;
  }
}
