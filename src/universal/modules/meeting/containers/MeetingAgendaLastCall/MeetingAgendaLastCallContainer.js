import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import MeetingAgendaLastCall from 'universal/modules/meeting/components/MeetingAgendaLastCall/MeetingAgendaLastCall';
import getFacilitatorName from 'universal/modules/meeting/helpers/getFacilitatorName';

const meetingAgendaLastCallQuery = `
query {
  agenda(teamId: $teamId) @live {
    id
    content
    isComplete
  }
}`;

const mapStateToProps = (state, props) => {
  const {team: {id: teamId}} = props;
  const {agenda} = cashay.query(meetingAgendaLastCallQuery, {
    op: 'meetingAgendaLastCallContainer',
    key: teamId,
    variables: {teamId},
    filter: {
      agenda: (doc) => doc.isComplete === true
    }
  }).data;
  return {
    agendaItemCount: agenda.length,
  };
};

const MeetingAgendaLastCallContainer = (props) => {
  const {
    agendaItemCount,
    gotoNext,
    hideMoveMeetingControls,
    members,
    team
  } = props;
  return (
    <MeetingAgendaLastCall
      agendaItemCount={agendaItemCount}
      gotoNext={gotoNext}
      facilitatorName={getFacilitatorName(team, members)}
      hideMoveMeetingControls={hideMoveMeetingControls}
    />
  );
};

MeetingAgendaLastCallContainer.propTypes = {
  agendaItemCount: PropTypes.number,
  gotoNext: PropTypes.func,
  hideMoveMeetingControls: PropTypes.bool,
  isFacilitating: PropTypes.bool,
  members: PropTypes.array,
  team: PropTypes.object
};

export default connect(mapStateToProps)(MeetingAgendaLastCallContainer);
