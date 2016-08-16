import React, {PropTypes} from 'react';
import subscriptions from 'universal/subscriptions/subscriptions';
import {AGENDA, TEAM_MEMBERS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import AgendaInput from 'universal/modules/teamDashboard/components/AgendaInput/AgendaInput';
import shortid from 'shortid';
import {getAuthQueryString, authedOptions} from 'universal/redux/getAuthedUser';
import getNextSort from 'universal/utils/getNextSort';

const teamMembersSubString = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;
const agendaSubString = subscriptions.find(sub => sub.channel === AGENDA).string;

const mapStateToProps = (state, props) => {
  const variables = {teamId: props.teamId};
  return {
    agendaSub: cashay.subscribe(agendaSubString, subscriber, {op: 'agendaSub', variables}),
    memberSub: cashay.subscribe(teamMembersSubString, subscriber, {op: 'memberSub', variables}),
    user: cashay.query(getAuthQueryString, authedOptions).data.user
  };
};

const AgendaInputContainer = (props) => {
  const {agendaSub, memberSub, teamId, user} = props;
  const {teamMembers} = memberSub.data;
  const {agenda} = agendaSub.data;
  const teamMemberId = `${user.id}::${teamId}`;
  const nextSort = getNextSort(agenda, 'sort');
  const handleAgendaItemSubmit = (submittedData) => {
    const content = submittedData.agendaItem;
    const options = {
      variables: {
        newAgendaItem: {
          id: `${teamId}::${shortid.generate()}`,
          content,
          sort: nextSort,
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
  agendaSub: PropTypes.object,
  memberSub: PropTypes.object,
  teamId: PropTypes.string.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string
  })
};

export default connect(mapStateToProps)(AgendaInputContainer);
