import React, {PropTypes} from 'react';
import Team from 'universal/modules/teamDashboard/components/Team/Team';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';

const TeamContainer = (props) => {
  const {params: {meetingId}, user, ...otherProps} = props;
  return <Team meetingId={meetingId} user={user} {...otherProps} />;
};

TeamContainer.propTypes = {
  params: PropTypes.shape({
    meetingId: PropTypes.string.isRequired
  }),
  user: PropTypes.object
};

export default requireAuth(TeamContainer);
