import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import AgendaAndProjects from 'universal/modules/teamDashboard/components/AgendaAndProjects/AgendaAndProjects';

const agendaAndProjectsQuery = `
query {
  myTeamMember @cached(type: "TeamMember") {
    id
    hideAgenda
  }
}`;

const mapStateToProps = (state, props) => {
  const {params: {teamId}} = props;
  const userId = state.auth.obj.sub;
  const {myTeamMember} = cashay.query(agendaAndProjectsQuery, {
    variables: {teamId},
    op: 'agendaAndProjectsContainer',
    key: teamId,
    resolveCached: {
      myTeamMember: () => `${userId}::${teamId}`
    },
  }).data;
  return {
    hideAgenda: myTeamMember.hideAgenda,
  };
};

const AgendaAndProjectsContainer = (props) => {
  const {
    params: {teamId},
    hideAgenda
  } = props;
  return (
    <AgendaAndProjects
      hideAgenda={hideAgenda}
      teamId={teamId}
    />
  );
};

AgendaAndProjectsContainer.propTypes = {
  hideAgenda: PropTypes.bool,
  params: PropTypes.object,
  teamId: PropTypes.string
};

export default connect(mapStateToProps)(AgendaAndProjectsContainer);
