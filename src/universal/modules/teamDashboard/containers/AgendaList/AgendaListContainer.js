import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import AgendaList from 'universal/modules/teamDashboard/components/AgendaList/AgendaList';
import {resolveSortedAgenda} from 'universal/modules/teamDashboard/helpers/computedValues';

const mapStateToProps = (state, props) => {
  return {
    agenda: cashay.computed('sortedAgenda', [props.teamId], resolveSortedAgenda)
  };
};

const AgendaListContainer = (props) => {
  const {agenda} = props;
  return <AgendaList agenda={agenda}/>;
};

AgendaListContainer.propTypes = {
  teamId: PropTypes.string,
  agenda: PropTypes.array,
};

export default connect(mapStateToProps)(AgendaListContainer);
