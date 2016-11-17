import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import MeetingAgendaLastCall from 'universal/modules/meeting/components/MeetingAgendaLastCall/MeetingAgendaLastCall';

const meetingAgendaLastCallQuery = `
query {
  agenda(teamId: $teamId) @live {
    id
    content
    isComplete
    actions @cached(type: "[Action]") {
      id
    }
    projects @cached(type: "[Project]") {
      id
    }
  }
}`;

const mapStateToProps = (state, props) => {
  const {team: {id: teamId}} = props;
  const {agenda} = cashay.query(meetingAgendaLastCallQuery, {
    op: 'meetingAgendaLastCallContainer',
    key: teamId,
    variables: {teamId},
    resolveCached: {
      actions: (source) => (doc) => doc.agendaId === source.id,
      projects: (source) => (doc) => doc.agendaId === source.id
    },
    filter: {
      agenda: (doc) => doc.isComplete === true
    }
  }).data;
  return {
    agendaItemCount: agenda.length,
  };
};

const MeetingAgendaLastCallContainer = (props) => {
  const {agendaItemCount, gotoNext, isFacilitating, members, team} = props;
  const facilitator = members.find(member => member.id === team.activeFacilitator);
  const facilitatorName = facilitator && facilitator.preferredName || 'Facilitator';
  return (
    <MeetingAgendaLastCall
      agendaItemCount={agendaItemCount}
      gotoNext={gotoNext}
      facilitatorName={facilitatorName}
      isFacilitating={isFacilitating}
    />
  );
};

MeetingAgendaLastCallContainer.propTypes = {
  agendaItemCount: PropTypes.number,
  gotoNext: PropTypes.func,
  isFacilitating: PropTypes.bool,
  members: PropTypes.array,
  team: PropTypes.object
};

export default connect(mapStateToProps)(MeetingAgendaLastCallContainer);
