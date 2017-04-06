import getRethink from 'server/database/rethinkDriver';
import {ADD_TO_TEAM, REJOIN_TEAM, PRESENCE, USER_MEMO} from 'universal/subscriptions/constants';

export default async function reactivateTeamMembers(idsToReactivate, teamId, teamName, exchange, sender) {
  if (idsToReactivate.length > 0) {
    const r = getRethink();
    const userIdsToReactivate = idsToReactivate.map((teamMemberId) => {
      return teamMemberId.substr(0, teamMemberId.indexOf('::'));
    });
    const reactivatedUsers = await r.table('TeamMember')
      .getAll(r.args(idsToReactivate), {index: 'id'})
      .update({isNotRemoved: true})
      .do(() => {
        return r.table('User')
          .getAll(r.args(userIdsToReactivate))
          .update((user) => {
            return user.merge({
              tms: user('tms').append(teamId)
            });
          }, {returnChanges: true})('changes')
          .map((change) => change('new_val'));
      });
    reactivatedUsers.forEach((user) => {
      const {preferredName, id: reactivatedUserId} = user;
      const userChannel = `${USER_MEMO}/${reactivatedUserId}`;
      exchange.publish(userChannel, {type: ADD_TO_TEAM, teamId, teamName});
      const channel = `${PRESENCE}/${teamId}`;
      exchange.publish(channel, {
        type: REJOIN_TEAM,
        name: preferredName,
        sender
      });
    });
  }
}
