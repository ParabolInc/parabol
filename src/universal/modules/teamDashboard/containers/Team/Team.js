import React, {PropTypes} from 'react';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import reduxSocketOptions from 'universal/redux/reduxSocketOptions';
import {reduxSocket} from 'redux-socket-cluster';

@requireAuth
@reduxSocket({}, reduxSocketOptions)
export default class TeamContainer extends Component {
  static propTypes = {
    params: PropTypes.shape({
      teamId: PropTypes.string.isRequired
    }),
    user: PropTypes.object
  };

  render() {
    const {params: {teamId}, user, ...otherProps} = this.props;
    return <Team teamId={teamId} user={user} {...otherProps} />;
  }
};
