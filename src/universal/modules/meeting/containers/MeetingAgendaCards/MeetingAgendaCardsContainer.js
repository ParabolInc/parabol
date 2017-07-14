import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import MeetingAgendaCards from 'universal/modules/meeting/components/MeetingAgendaCards/MeetingAgendaCards';

const meetingAgendaCardsQuery = `
query {
  agendaProjects(agendaId: $agendaId) @live {
    id
    agendaId
    content
    createdAt
    createdBy
    updatedAt
    status
    tags
    teamMember @cached(type: "TeamMember") {
      id
      picture
      preferredName
    }
    teamMemberId
  }
}
`;

const mapStateToProps = (state, props) => {
  const {agendaId} = props;
  const {agendaProjects} = cashay.query(meetingAgendaCardsQuery, {
    op: 'meetingAgendaCardsContainer',
    key: agendaId,
    variables: {agendaId},
    resolveCached: {
      teamMember: (source) => source.teamMemberId
    },
    sort: {
      agendaProjects: (a, b) => a.createdAt - b.createdAt
    }
  }).data;
  return {
    outcomes: agendaProjects
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
