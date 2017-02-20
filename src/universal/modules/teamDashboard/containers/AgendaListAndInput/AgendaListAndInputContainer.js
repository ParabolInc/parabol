import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import AgendaListAndInput from 'universal/modules/teamDashboard/components/AgendaListAndInput/AgendaListAndInput';
import handleAgendaSort from 'universal/modules/meeting/helpers/handleAgendaSort';

const agendaSubQuery = `
query {
  agenda(teamId: $teamId) @live {
    id
    content
    isComplete
    sortOrder
    teamMemberId
    teamMember @cached(type: "TeamMember") {
      id
      picture
      preferredName
    }
  },
  myTeamMember @cached(type: "TeamMember") {
    id
    picture
    preferredName
  }
}`;

const mutationHandlers = {
  updateAgendaItem: handleAgendaSort
};

const mapStateToProps = (state, props) => {
  const {teamId} = props;
  const userId = state.auth.obj.sub;
  const agendaAndTeamMembers = cashay.query(agendaSubQuery, {
    variables: {teamId},
    op: 'agendaListAndInputContainer',
    mutationHandlers,
    key: teamId,
    resolveCached: {
      teamMember: (source) => source.teamMemberId,
      myTeamMember: () => `${userId}::${teamId}`
    },
    sort: {
      agenda: (a, b) => a.sortOrder - b.sortOrder
    }
  });
  const {agenda, myTeamMember} = agendaAndTeamMembers.data;
  return {
    agenda,
    teamId,
    myTeamMember,
  };
};

const AgendaListAndInputContainer = (props) => {
  const {
    agendaPhaseItem,
    agenda,
    context,
    disabled,
    gotoItem,
    myTeamMember,
    teamId
  } = props;
  return (
    <AgendaListAndInput
      agenda={agenda}
      agendaPhaseItem={agendaPhaseItem}
      context={context}
      disabled={disabled}
      gotoItem={gotoItem}
      myTeamMember={myTeamMember}
      teamId={teamId}
    />
  );
};

AgendaListAndInputContainer.propTypes = {
  agenda: PropTypes.array,
  agendaPhaseItem: PropTypes.number,
  context: PropTypes.oneOf([
    'dashboard',
    'meeting'
  ]),
  disabled: PropTypes.bool,
  gotoItem: PropTypes.func.isRequired,
  myTeamMember: PropTypes.object,
  teamId: PropTypes.string
};

export default connect(mapStateToProps)(AgendaListAndInputContainer);
