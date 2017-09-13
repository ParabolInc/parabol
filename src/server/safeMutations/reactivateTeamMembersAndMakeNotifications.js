import getRethink from 'server/database/rethinkDriver';
import shortid from 'shortid';
import {ADD_TO_TEAM} from 'universal/utils/constants';
import makeReactivationNotifications from 'server/safeMutations/helpers/makeReactivationNotifications';

const reactivateTeamMembersAndMakeNotifications = async (invitees, inviter, teamMembers) => {
  if (invitees.length === 0) return [];
  const {orgId, teamId, teamName} = inviter;
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
      }, {returnChanges: true})('changes')
      .map((change) => change('new_val'))
      .default([])
  });
  const notifications = reactivatedUsers.map((user) => ({
    id: shortid.generate(),
    type: ADD_TO_TEAM,
    startAt: now,
    orgId,
    userIds: [user.id],
    //inviterName,
    teamName
  }));
  await r.table('Notification').insert(notifications);
  return makeReactivationNotifications(reactivatedUsers, teamMembers, inviter.userId);
};

export default reactivateTeamMembersAndMakeNotifications;
