import React, {PropTypes} from 'react';
import {withRouter} from 'react-router';
import ArchiveTeam from 'universal/modules/teamDashboard/components/ArchiveTeam/ArchiveTeam';

const ArchiveTeamContainer = (props) => {
  const {
    teamId,
    teamName,
    router
  } = props;

  return (
    <ArchiveTeam
      teamId={teamId}
      teamName={teamName}
      router={router}
    />
  );
};

ArchiveTeamContainer.propTypes = {
  teamId: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  router: PropTypes.object.isRequired
};

export default withRouter(ArchiveTeamContainer);
