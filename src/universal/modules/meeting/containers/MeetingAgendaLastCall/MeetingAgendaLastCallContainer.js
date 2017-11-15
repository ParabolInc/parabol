import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import MeetingAgendaLastCall from 'universal/modules/meeting/components/MeetingAgendaLastCall/MeetingAgendaLastCall';

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
    agendaItemCount: agenda.length
  };
};

const MeetingAgendaLastCallContainer = (props) => {
  const {
    agendaItemCount,
    facilitatorName,
    gotoNext,
    hideMoveMeetingControls
  } = props;
  return (
    <MeetingAgendaLastCall
      agendaItemCount={agendaItemCount}
      gotoNext={gotoNext}
      facilitatorName={facilitatorName}
      hideMoveMeetingControls={hideMoveMeetingControls}
    />
  );
};

MeetingAgendaLastCallContainer.propTypes = {
  agendaItemCount: PropTypes.number,
  facilitatorName: PropTypes.string.isRequired,
  gotoNext: PropTypes.func,
  hideMoveMeetingControls: PropTypes.bool
};

export default connect(mapStateToProps)(MeetingAgendaLastCallContainer);
