import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import MeetingAgendaCards from 'universal/modules/meeting/components/MeetingAgendaCards/MeetingAgendaCards';

const meetingAgendaCardsQuery = `
query {
  outcomes @cached(id: $agendaId, type: "[Outcome]") {
    id
    type: __typename
    content
    createdAt
    updatedAt
    teamMemberId
    teamMember @cached(type: "TeamMember") {
      picture
      preferredName
    }
    agendaId
    ... on Project {
      status
    }
    ... on Action {
      isComplete
    }
  }
}
`;

const mapStateToProps = (state, props) => {
  const {agendaId} = props;
  const {outcomes} = cashay.query(meetingAgendaCardsQuery, {
    op: 'meetingAgendaCardsContainer',
    key: agendaId,
    variables: {agendaId},
    resolveCached: {
      outcomes: (source, args) => (doc) => doc.agendaId === args.id,
      teamMember: (source) => source.teamMemberId
    },
    sort: {
      outcomes: (a, b) => a.createdAt > b.createdAt
    }
  }).data;
  return {
    outcomes
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
