import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import MeetingAgendaItems
  from 'universal/modules/meeting/components/MeetingAgendaItems/MeetingAgendaItems';
import LoadingView from 'universal/components/LoadingView/LoadingView';

const meetingAgendaItemsQuery = `
query {
  agenda(teamId: $teamId) @live {
    id
    content
    isComplete
    sortOrder
    teamMemberId
    actionsByAgenda @live {
      id
    }
  }
  teamMembers(teamId: $teamId) @live {
    id
    projects @live {
        id
      }
  }
}`;

const mapStateToProps = (state, props) => {
  const {team: {id: teamId}} = props;
  const {agenda} = cashay.query(meetingAgendaItemsQuery, {
    op: 'meetingAgendaItemsContainer',
    key: teamId,
    variables: {teamId}
  }).data;
  return {
    agenda
  };
};

const MeetingAgendaItemsContainer = (props) => {
  // TODO: handle when there are no agenda items? Or, perhaps first call
  // It's possible that the agenda items just haven't loaded yet -_- MK
  //       just skips to last call...
  if (!props.agenda || props.agenda.length < 1) {
    return <LoadingView />;
  }
  return <MeetingAgendaItems {...props}/>;
};

MeetingAgendaItemsContainer.propTypes = {
  agenda: PropTypes.array.isRequired
};

export default connect(mapStateToProps)(MeetingAgendaItemsContainer);
