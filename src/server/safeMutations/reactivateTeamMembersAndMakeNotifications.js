import getRethink from 'server/database/rethinkDriver';
import getPubSub from 'server/utils/getPubSub';
import tmsSignToken from 'server/utils/tmsSignToken';
import shortid from 'shortid';
import {ADD_TO_TEAM, NEW_AUTH_TOKEN} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

const reactivateTeamMembersAndMakeNotifications = async (invitees, inviter) => {
  if (invitees.length === 0) return [];
  const {orgId, teamId, teamName} = inviter;
  const r = getRethink();
  const now = new Date();
  const userIds = invitees.map(({userId}) => userId);
  const teamMemberIds = invitees
    .map(({teamMemberId}) => teamMemberId)
    .filter(Boolean);
  const {reactivatedUsers} = await r({
    reactivatedTeamMembers: r.table('TeamMember')
      .getAll(r.args(teamMemberIds), {index: 'id'})
      .update({isNotRemoved: true}),
    reactivatedUsers: r.table('User')
      .getAll(r.args(userIds))
      .update((user) => {
        return user.merge({
          tms: user('tms').append(teamId)
        });
      }, {returnChanges: true})('changes')('new_val')
  });
  const notifications = reactivatedUsers.map((user) => ({
    id: shortid.generate(),
    type: ADD_TO_TEAM,
    startAt: now,
    orgId,
    userIds: [user.id],
    teamId,
    teamName
  }));
  await r.table('Notification').insert(notifications);
  reactivatedUsers.forEach(({id: userId, tms}) => {
    getPubSub().publish(`${NEW_AUTH_TOKEN}.${userId}`, {newAuthToken: tmsSignToken({sub: userId}, tms)});
  });

  return notifications.map((notification, idx) => ({
    notificationId: notification.id,
    teamMemberId: toTeamMemberId(teamId, notification.userIds[0]),
    preferredName: reactivatedUsers[idx].preferredName
  }));
};

export default reactivateTeamMembersAndMakeNotifications;
