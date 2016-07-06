import React, {Component, PropTypes} from 'react';
import Me from 'universal/modules/userDashboard/components/Me/Me';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {connect} from 'react-redux';

const mapStateToProps = (state, router) => {
  console.log(router.location.pathname);
  return {
    authToken: state.authToken,
    location: router.location.pathname
  };
};

@connect(mapStateToProps)
@requireAuth
// eslint-disable-next-line react/prefer-stateless-function
export default class MeContainer extends Component {
  static propTypes = {
    location: PropTypes.string,
    user: PropTypes.object
  };

  render() {
    const {location, user, ...props} = this.props;
    return <Me location={location} user={user} {...props} />;
  }
}
