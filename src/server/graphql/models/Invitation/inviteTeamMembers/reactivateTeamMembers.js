// import getRethink from 'server/database/rethinkDriver';
// import getPubSub from 'server/utils/getPubSub';
// import {PRESENCE, REJOIN_TEAM, USER_MEMO} from 'universal/subscriptions/constants';
// import {ADD_TO_TEAM} from 'universal/utils/constants';
// import tmsSignToken from 'server/utils/tmsSignToken';
//
// export default async function reactivateTeamMembers(idsToReactivate, teamId, teamName, exchange, sender) {
//  if (idsToReactivate.length > 0) {
//    const r = getRethink();
//    const userIdsToReactivate = idsToReactivate.map((teamMemberId) => {
//      return teamMemberId.substr(0, teamMemberId.indexOf('::'));
//    });
//    const reactivatedUsers = await r.table('TeamMember')
//      .getAll(r.args(idsToReactivate), {index: 'id'})
//      .update({isNotRemoved: true})
//      .do(() => {
//        return r.table('User')
//          .getAll(r.args(userIdsToReactivate))
//          .update((user) => {
//            return user.merge({
//              tms: user('tms').append(teamId)
//            });
//          }, {returnChanges: true})('changes')
//          .default([])
//          .map((change) => change('new_val'));
//      });
//    reactivatedUsers.forEach((user) => {
//      const {preferredName, id: reactivatedUserId, tms} = user;
//      getPubSub().publish(`${USER_MEMO}/${reactivatedUserId}`, {
//        type: ADD_TO_TEAM,
//        teamId,
//        teamName,
//        _authToken: tmsSignToken({sub: reactivatedUserId}, tms)
//      });
//      const channel = `${PRESENCE}/${teamId}`;
//      exchange.publish(channel, {
//        type: REJOIN_TEAM,
//        name: preferredName,
//        sender
//      });
//    });
//  }
// }
