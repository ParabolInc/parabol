import React, {PropTypes} from 'react';
import subscriptions from 'universal/subscriptions/subscriptions';
import {AGENDA, TEAM_MEMBERS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import AgendaInput from 'universal/modules/teamDashboard/components/AgendaInput/AgendaInput';
import shortid from 'shortid';
import {getAuthQueryString, authedOptions} from 'universal/redux/getAuthedUser';
import {STEP} from 'universal/utils/constants';

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
  const teamMemberId = `${user.id}::${teamId}`;
  const maxSort = Math.max.apply(Math, agendaSub.data.agenda.map(item => item.sort));
  // if there are no agenda items or none with a sort field
  const safeMaxSort = (maxSort === -Infinity || isNaN(maxSort)) ? -1 : maxSort;
  const handleAgendaItemSubmit = ({agendaItem}) => {
    const options = {
      variables: {
        newAgendaItem: {
          id: `${teamId}::${shortid.generate()}`,
          content: agendaItem,
          sort: safeMaxSort + STEP,
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
  teamId: PropTypes.string.isRequired,
  memberSub: PropTypes.object,
};

export default connect(mapStateToProps)(AgendaInputContainer);
