import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import AgendaList from 'universal/modules/teamDashboard/components/AgendaList/AgendaList';
import {resolveSortedAgenda} from 'universal/modules/teamDashboard/helpers/computedValues';
import subscriber from 'universal/subscriptions/subscriber';
import {TEAM_MEMBERS} from 'universal/subscriptions/constants';
import subscriptions from 'universal/subscriptions/subscriptions';

const teamMembersSubQuery = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;

const mapStateToProps = (state, props) => {
  const {teamId} = props;
  const variables = {teamId};
  return {
    agenda: cashay.computed('sortedAgenda', [teamId], resolveSortedAgenda),
    teamMembers: cashay.subscribe(teamMembersSubQuery, subscriber, {
      key: teamId,
      op: TEAM_MEMBERS,
      variables
    }).data.teamMembers,
  };
};

const AgendaListContainer = (props) => {
  const {agenda, teamMembers} = props;
  return <AgendaList agenda={agenda} teamMembers={teamMembers}/>;
};

AgendaListContainer.propTypes = {
  teamId: PropTypes.string,
  teamMembers: PropTypes.array,
  agenda: PropTypes.array,
};

export default connect(mapStateToProps)(AgendaListContainer);
