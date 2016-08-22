import React, {PropTypes} from 'react';
import subscriptions from 'universal/subscriptions/subscriptions';
import {AGENDA, TEAM_MEMBERS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import AgendaInput from 'universal/modules/teamDashboard/components/AgendaInput/AgendaInput';
import shortid from 'shortid';
import {resolveSortedAgenda} from 'universal/modules/teamDashboard/helpers/computedValues';
import {SORT_STEP} from 'universal/utils/constants';

const teamMembersSubQuery = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;

const mapStateToProps = (state, props) => {
  const {teamId} = props;
  const variables = {teamId};
  return {
    agenda: cashay.computed('sortedAgenda', [props.teamId], resolveSortedAgenda),
    teamMembers: cashay.subscribe(teamMembersSubQuery, subscriber, {key: teamId, op: TEAM_MEMBERS, variables}).data.teamMembers,
    userId: state.auth.obj.sub
  };
};

const AgendaInputContainer = (props) => {
  const {agenda, teamMembers, teamId, userId} = props;
  const teamMemberId = `${userId}::${teamId}`;
  const lastAgendaItem = agenda[agenda.length - 1];
  const nextSort = lastAgendaItem ? lastAgendaItem.sortOrder + SORT_STEP : 0;
  const handleAgendaItemSubmit = (submittedData) => {
    const content = submittedData.agendaItem;
    const options = {
      variables: {
        newAgendaItem: {
          id: `${teamId}::${shortid.generate()}`,
          content,
          sortOrder: nextSort,
          teamMemberId
        }
      }
    };
    cashay.mutate('createAgendaItem', options);
  };

  return (
    <AgendaInput
      teamMemberId={teamMemberId}
      teamMembers={teamMembers}
      handleAgendaItemSubmit={handleAgendaItemSubmit}
    />
  );
};

AgendaInputContainer.propTypes = {
  agenda: PropTypes.array,
  teamMembers: PropTypes.array,
  teamId: PropTypes.string,
  userId: PropTypes.string
};

export default connect(mapStateToProps)(AgendaInputContainer);
