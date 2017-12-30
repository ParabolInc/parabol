import getRethink from 'server/database/rethinkDriver';
import makeReactivationNotifications from 'server/safeMutations/helpers/makeReactivationNotifications';
import shortid from 'shortid';
import {ADD_TO_TEAM, ADDED, NEW_AUTH_TOKEN, TEAM_MEMBER} from 'universal/utils/constants';
import getPubSub from 'server/utils/getPubSub';
import tmsSignToken from 'server/utils/tmsSignToken';

const reactivateTeamMembersAndMakeNotifications = async (invitees, inviter, teamMembers, subOptions = {}) => {
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
  teamMemberIds.forEach((teamMemberId) => {
    getPubSub().publish(`${TEAM_MEMBER}.${teamId}`, {data: {teamMemberId, type: ADDED}, ...subOptions});
  });

  const reactivationNotifications = makeReactivationNotifications(notifications, reactivatedUsers, teamMembers, inviter);
  reactivatedUsers.forEach(({id: userId, tms}) => {
    getPubSub().publish(`${NEW_AUTH_TOKEN}.${userId}`, {newAuthToken: tmsSignToken({sub: userId}, tms)});
  });
  return reactivationNotifications;
};

export default reactivateTeamMembersAndMakeNotifications;
