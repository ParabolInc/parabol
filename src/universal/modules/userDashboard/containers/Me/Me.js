import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

import Me from 'universal/modules/userDashboard/components/Me/Me';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';

// const selector = formValueSelector('userPreferences');

const mapStateToProps = (state, router) => {
  return {
    authToken: state.authToken,
    location: router.location.pathname,
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
