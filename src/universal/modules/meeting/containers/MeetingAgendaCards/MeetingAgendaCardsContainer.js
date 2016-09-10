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
  console.log('agendaId', agendaId);
  const {outcomes} = cashay.query(meetingAgendaCardsQuery, {
    op: 'meetingAgendaCardsContainer',
    key: agendaId,
    variables: {agendaId},
    resolveCached: {
      outcomes: (source, args) => (doc) => doc.agendaId === args.id
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
  return <MeetingAgendaCards {...props}/>;
};

MeetingAgendaCardsContainer.propTypes = {
  outcomes: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(MeetingAgendaCardsContainer);
