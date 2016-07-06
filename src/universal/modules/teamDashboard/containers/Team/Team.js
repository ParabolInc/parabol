import React, {Component, PropTypes} from 'react';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {connect} from 'react-redux';

const mapStateToProps = (state, router) => {
  const {params} = router;
  return {
    authToken: state.authToken,
    urlParams: params
  };
};

@connect(mapStateToProps)
@requireAuth
// eslint-disable-next-line react/prefer-stateless-function
export default class TeamContainer extends Component {
  static propTypes = {
    urlParams: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired,
    user: PropTypes.object
  };

  render() {
    const {urlParams, user} = this.props;
    return <Team urlParams={urlParams} user={user} />;
  }
}
