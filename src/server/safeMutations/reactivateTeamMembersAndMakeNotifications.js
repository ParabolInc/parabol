import getRethink from 'server/database/rethinkDriver';
import tmsSignToken from 'server/utils/tmsSignToken';
import shortid from 'shortid';
import {ADD_TO_TEAM, REJOIN_TEAM} from 'universal/utils/constants';


const makeReactivationNotifications = (reactivatedUsers, teamMembers, inviter) => {
  const {teamId, teamName, inviterName, userId} = inviter;
  const restOfTeamUserIds = teamMembers
    .filter((m) => m.isNotRemoved === true && m.id !== userId)
    .map((m) => m.userId);
  const notificationsToSend = {};
  reactivatedUsers.forEach((user) => {
    const {preferredName, id: reactivatedUserId, tms} = user;

    // make a notification to the person being reactivated
    notificationsToSend[reactivatedUserId] = [{
      _authToken: tmsSignToken({sub: reactivatedUserId}, tms),
      inviterName,
      teamId,
      teamName,
      type: ADD_TO_TEAM
    }];

    // make a notification for the other team members annoucing the reactivation
    const rejoinNotification = {
      teamName,
      preferredName,
      type: REJOIN_TEAM
    };
    restOfTeamUserIds.forEach((notificationUserId) => {
      notificationsToSend[notificationUserId] = [rejoinNotification];
    });
  });
  return notificationsToSend;
};

const reactivateTeamMembersAndMakeNotifications = async (invitees, inviter, teamMembers) => {
  if (invitees.length === 0) return [];
  const {orgId, teamId, teamName, inviterName} = inviter;
  const r = getRethink();
  const now = new Date();
  const userIds = invitees.map(({userId}) => userId);
  const teamMemberIds = userIds.map((userId) => `${userId}::${teamId}`);
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
      .default(null)
  });
  const notifications = reactivatedUsers.map((user) => ({
    id: shortid.generate(),
    type: ADD_TO_TEAM,
    startAt: now,
    orgId,
    userIds: [user.id],
    inviterName,
    teamName
  }));
  await r.table('Notification').insert(notifications);
  return makeReactivationNotifications(reactivatedUsers, teamMembers, inviter.userId)
};

export default reactivateTeamMembersAndMakeNotifications;