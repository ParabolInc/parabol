import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import MeetingAgendaCards from 'universal/modules/meeting/components/MeetingAgendaCards/MeetingAgendaCards';

const meetingAgendaCardsQuery = `
query {
  teamMembers(teamId: $teamId) @live {
    id
    projects(teamMemberId: $teamMemberId) @live {
      id
      agendaId
      type: __typename
      content
      createdAt
      createdBy
      status
      teamMember @cached(type: "TeamMember") {
        picture
        preferredName
      }
      teamMemberId
    }
  }
  agenda(teamId: $teamId) @live {
    id
    actionsByAgenda @live {
      id
      agendaId
      type: __typename
      content
      createdAt
      createdBy
      teamMember @cached(type: "TeamMember") {
        picture
        preferredName
      }
      teamMemberId
      isComplete
    }
  }
}
`;

const makeOutcomes = (queryData) => {
  if (queryData !== makeOutcomes.queryData) {
    makeOutcomes.queryData = queryData;
    const {teamMembers, agenda} = queryData;
    makeOutcomes.cache = [];
    const filteredAgendaItem = agenda[0];
    if (filteredAgendaItem) {
      makeOutcomes.cache.push(...filteredAgendaItem.actionsByAgenda);
    }
    for (let i = 0; i < teamMembers.length; i++) {
      const {projects} = teamMembers[i];
      makeOutcomes.cache.push(...projects);
    }
    makeOutcomes.cache.sort((a, b) => a.createdAt - b.createdAt);
  }
  return makeOutcomes.cache;
};

const mapStateToProps = (state, props) => {
  const {agendaId, myTeamMemberId} = props;
  const [, teamId] = myTeamMemberId.split('::');
  const queryData = cashay.query(meetingAgendaCardsQuery, {
    op: 'meetingAgendaCardsContainer',
    key: agendaId,
    variables: {teamId},
    resolveCached: {
      outcomes: (source, args) => (doc) => doc.agendaId === args.id,
      teamMember: (source) => source.teamMemberId
    },
    filter: {
      agenda: (a) => a.id === agendaId,
      projects: (outcome) => outcome.agendaId === agendaId,
    },
  }).data;

  return {
    outcomes: makeOutcomes(queryData)
  };
};

const MeetingAgendaCardsContainer = (props) => {
  const {agendaId, dispatch, myTeamMemberId, outcomes} = props;
  return (
    <MeetingAgendaCards
      agendaId={agendaId}
      myTeamMemberId={myTeamMemberId}
      outcomes={outcomes}
      dispatch={dispatch}
    />
  );
};

MeetingAgendaCardsContainer.propTypes = {
  agendaId: PropTypes.string,
  dispatch: PropTypes.func,
  myTeamMemberId: PropTypes.string,
  outcomes: PropTypes.array.isRequired
};

export default connect(mapStateToProps)(MeetingAgendaCardsContainer);
