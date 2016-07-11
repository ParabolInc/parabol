import React, {PropTypes} from 'react';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';

const TeamContainer = (props) => {
  const {teamId, user, ...otherProps} = props;
  return <Team teamId={teamId} user={user} {...otherProps} />;
};

TeamContainer.propTypes = {
  teamId: PropTypes.string.isRequired,
  user: PropTypes.object
};

export default requireAuth(TeamContainer);
