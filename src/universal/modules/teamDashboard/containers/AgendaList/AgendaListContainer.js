import React, {PropTypes} from 'react';
import subscriptions from 'universal/subscriptions/subscriptions';
import {AGENDA} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import AgendaList from 'universal/modules/teamDashboard/components/AgendaList/AgendaList';

const agendaSubString = subscriptions.find(sub => sub.channel === AGENDA).string;

const mapStateToProps = (state, props) => {
  const variables = {teamId: props.teamId};
  return {
    agendaSub: cashay.subscribe(agendaSubString, subscriber, {op: 'agendaSub', variables})
  };
};

const AgendaListContainer = (props) => {
  const {agendaSub} = props;
  const {agenda} = agendaSub.data;
  const sortedAgenda = agenda.sort((a, b) => a.sort > b.sort);
  return <AgendaList agenda={sortedAgenda}/>;
};

AgendaListContainer.propTypes = {
  teamId: PropTypes.string.isRequired,
  agendaSub: PropTypes.object,
};

export default connect(mapStateToProps)(AgendaListContainer);
