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
      content
      createdAt
      createdBy
      status
      tags
      teamMember @cached(type: "TeamMember") {
        picture
        preferredName
      }
      teamMemberId
    }
  }
}
`;

const makeOutcomes = (queryData) => {
  if (queryData !== makeOutcomes.queryData) {
    makeOutcomes.queryData = queryData;
    const {teamMembers} = queryData;
    makeOutcomes.cache = [];
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
    key: teamId,
    variables: {teamId},
    resolveCached: {
      teamMember: (source) => source.teamMemberId
    },
    filter: {
      projects: (outcome) => outcome.agendaId === agendaId
    }
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
