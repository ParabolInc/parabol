import getRethink from 'server/database/rethinkDriver';
import archiveTasksForManyRepos from 'server/safeMutations/archiveTasksForManyRepos';
import removeGitHubReposForUserId from 'server/safeMutations/removeGitHubReposForUserId';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import getPubSub from 'server/utils/getPubSub';
import tmsSignToken from 'server/utils/tmsSignToken';
import shortid from 'shortid';
import {GITHUB, KICKED_OUT, NEW_AUTH_TOKEN, NOTIFICATIONS_ADDED} from 'universal/utils/constants';

const removeAllTeamMembers = async (maybeTeamMemberIds, options) => {
  const {isKickout} = options;
  const r = getRethink();
  const now = new Date();
  const teamMemberIds = Array.isArray(maybeTeamMemberIds) ? maybeTeamMemberIds : [maybeTeamMemberIds];
  const [userId] = teamMemberIds[0].split('::');
  const teamIds = teamMemberIds.map((teamMemberId) => teamMemberId.substr(teamMemberId.indexOf('::') + 2));
  // see if they were a leader, make a new guy leader so later we can reassign tasks
  await r.table('TeamMember')
    .getAll(r.args(teamMemberIds), {index: 'id'})
    .filter({isLead: true, isNotRemoved: true})
    .merge((leader) => ({
      teamCount: r.table('TeamMember')
        .getAll(leader('teamId'), {index: 'teamId'})
        .filter({isNotRemoved: true})
        .count()
    }))
    .forEach((leader) => {
      return r.branch(
        leader('teamCount').eq(1),
        // delete the team if they're the only one on it
        r.table('Team').get(leader('teamId')).delete(),
        // set the next oldest person as team lead
        r.table('TeamMember')
          .getAll(leader('teamId'), {index: 'teamId'})
          .filter({isLead: false, isNotRemoved: true})
          .merge((teamMember) => ({
            createdAt: r.table('User').get(teamMember('userId'))('createdAt').default(r.now())
          }))
          .orderBy('createdAt')
          .nth(0)('id')
          .do((teamMemberId) => {
            return r.table('TeamMember').get(teamMemberId)
              .update({
                isLead: true
              });
          })
          .do(() => {
            return r.table('TeamMember').get(leader('id'))
              .update({
                isLead: false
              });
          })
      );
    });

  // assign active tasks to the team lead
  const {changedProviders, newTMS, teams} = await r({
    teamMember: r.table('TeamMember')
      .getAll(r.args(teamMemberIds), {index: 'id'})
      .update({
        isNotRemoved: false,
        updatedAt: now
      }),
    tasks: r(teamIds).forEach((teamId) => {
      return r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({isLead: true, isNotRemoved: true})
        .nth(0)
        .do((teamLead) => {
          return r.table('Task')
            .getAll(r(userId).add('::').add(teamId), {index: 'teamMemberId'})
            .filter((task) => task('tags').contains('archived').not())
            .update({
              teamMemberId: teamLead('id'),
              userId: teamLead('userId')
            });
        });
    }),
    newTMS: r.table('User')
      .getAll(userId)
      .update((user) => {
        return user.merge({
          tms: user('tms').filter((teamId) => r.expr(teamIds).contains(teamId).not())
        });
      }, {returnChanges: true})('changes')(0)('new_val')('tms').default([]),
    changedProviders: r.table('Provider')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({userId, isActive: true})
      .update({
        isActive: false
      }, {returnChanges: true})('changes')('new_val').default([]),
    teams: r.table('Team')
      .getAll(r.args(teamIds), {index: 'id'})
      .pluck('id', 'name', 'orgId')
      .coerceTo('array'),
    // note this may be too aggressive since 1 notification could have multiple userIds. we need to refactor to a single userId
    notifications: r.table('Notification')
      .getAll(userId, {index: 'userIds'})
      .filter((notification) => r(teamIds).contains(notification('teamId')))
      .delete()
  });
  // update the tms on auth0 in async
  auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms: newTMS});

  const notifications = teams.map((team) => {
    const {id: teamId, name: teamName, orgId} = team;
    return {
      id: shortid.generate(),
      startAt: now,
      teamId,
      teamName,
      type: KICKED_OUT,
      orgId,
      userIds: [userId]
    };
  });

  if (isKickout) {
    await r.table('Notification').insert(notifications);
  }

  const notificationsAdded = {
    notifications: notifications.map((notification) => ({
      ...notification,
      isKickout
    }))
  };
  getPubSub().publish(`${NEW_AUTH_TOKEN}.${userId}`, {newAuthToken: tmsSignToken({sub: userId}, newTMS)});
  getPubSub().publish(`${NOTIFICATIONS_ADDED}.${userId}`, {notificationsAdded});

  const changedGitHubIntegrations = changedProviders.some((change) => change.service === GITHUB);
  if (changedGitHubIntegrations) {
    const repoChanges = await removeGitHubReposForUserId(userId, teamIds);
    // TODO send the archived tasks in a mutation payload
    await archiveTasksForManyRepos(repoChanges);
  }
  return true;
};

export default removeAllTeamMembers;
