import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import MeetingAgendaItems
  from 'universal/modules/meeting/components/MeetingAgendaItems/MeetingAgendaItems';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import {resolveSortedAgenda} from 'universal/modules/teamDashboard/helpers/computedValues';

const mapStateToProps = (state, props) => {
  const {team: {id: teamId}} = props;
  const agenda = cashay.computed('sortedAgenda', [teamId], resolveSortedAgenda);
  // TODO: some computed prop
  return {
    agenda,
  };
};

const MeetingAgendaItemsContainer = (props) => {
  // TODO: handle when there are no agenda items? Or, perhaps first call
  //       just skips to last call...
  if (!props.agenda || props.agenda.length < 1) {
    return <LoadingView />;
  }
  return <MeetingAgendaItems {...props}/>;
};

MeetingAgendaItemsContainer.propTypes = {
  agenda: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(MeetingAgendaItemsContainer);
