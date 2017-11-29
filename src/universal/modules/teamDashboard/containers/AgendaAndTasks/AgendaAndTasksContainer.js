import PropTypes from 'prop-types';
import React from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import AgendaAndTasks from 'universal/modules/teamDashboard/components/AgendaAndTasks/AgendaAndTasks';

const agendaAndTasksQuery = `
query {
  myTeamMember @cached(type: "TeamMember") {
    id
    hideAgenda
  }
}`;

const mapStateToProps = (state, props) => {
  const {match: {params: {teamId}}} = props;
  const userId = state.auth.obj.sub;
  const {myTeamMember} = cashay.query(agendaAndTasksQuery, {
    variables: {teamId},
    op: 'agendaAndTasksContainer',
    key: teamId,
    resolveCached: {
      myTeamMember: () => `${userId}::${teamId}`
    }
  }).data;
  return {
    hideAgenda: myTeamMember.hideAgenda,
    teamId
  };
};

const AgendaAndTasksContainer = (props) => {
  const {
    teamId,
    teamName,
    hideAgenda
  } = props;
  return (
    <AgendaAndTasks
      hideAgenda={hideAgenda}
      teamId={teamId}
      teamName={teamName}
    />
  );
};

AgendaAndTasksContainer.propTypes = {
  hideAgenda: PropTypes.bool,
  teamId: PropTypes.string,
  teamName: PropTypes.string
};

export default connect(mapStateToProps)(AgendaAndTasksContainer);
