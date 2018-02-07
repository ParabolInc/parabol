import getRethink from 'server/database/rethinkDriver';
import archiveTasksForManyRepos from 'server/safeMutations/archiveTasksForManyRepos';
import removeGitHubReposForUserId from 'server/safeMutations/removeGitHubReposForUserId';
import shortid from 'shortid';
import {GITHUB, KICKED_OUT} from 'universal/utils/constants';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';

const removeTeamMember = async (teamMemberId, options) => {
  const {isKickout} = options;
  const r = getRethink();
  const now = new Date();
  const {userId, teamId} = fromTeamMemberId(teamMemberId);

  // see if they were a leader, make a new guy leader so later we can reassign tasks
  const activeTeamMembers = await r.table('TeamMember').getAll(teamId, {index: 'teamId'});
  const teamMember = activeTeamMembers.find((t) => t.id === teamMemberId);
  const {isLead, isNotRemoved} = teamMember;
  // if the guy being removed is the leader, pick a new one. else, use him
  const teamLeader = activeTeamMembers.find((t) => t.isLead === !isLead);
  if (!isNotRemoved) {
    throw new Error('Team member already removed');
  }

  if (activeTeamMembers.length === 1) {
    await r.table('Team')
      .get(teamId)
      .update({isArchived: true});
  } else if (isLead) {
    await r({
      newTeamLead: r.table('TeamMember').get(teamLeader.id)
        .update({
          isLead: true
        }),
      oldTeamLead: r.table('TeamMember').get(teamMemberId).update({isLead: false})
    });
  }

  // assign active tasks to the team lead
  const {changedProviders, reassignedTasks, removedNotifications, user} = await r({
    teamMember: r.table('TeamMember')
      .get(teamMemberId)
      .update({
        isNotRemoved: false,
        updatedAt: now
      }),
    reassignedTasks: r.table('Task')
      .getAll(teamMemberId, {index: 'assigneeId'})
      .filter((task) => task('tags').contains('archived').not())
      .update({
        assigneeId: teamLeader.id,
        userId: teamLeader.userId
      }, {returnChanges: true})('changes')('new_val')
      .default([]),
    user: r.table('User')
      .get(userId)
      .update((myUser) => ({
        tms: myUser('tms').difference([teamId])
      }), {returnChanges: true})('changes')(0)('new_val')
      .default(null),
    changedProviders: r.table('Provider')
      .getAll(teamId, {index: 'teamId'})
      .filter({userId, isActive: true})
      .update({
        isActive: false
      }, {returnChanges: true})('changes')('new_val')
      .default([]),
    // note this may be too aggressive since 1 notification could have multiple userIds. we need to refactor to a single userId
    removedNotifications: r.table('Notification')
      .getAll(userId, {index: 'userIds'})
      .filter({teamId})
      .delete({returnChanges: true})('changes')('old_val')
      .default([])
  });

  let notificationId;
  if (isKickout) {
    notificationId = shortid.generate();
    await r.table('Notification').insert({
      id: notificationId,
      startAt: now,
      teamId,
      type: KICKED_OUT,
      userIds: [userId]
    });
  }

  const changedGitHubIntegrations = changedProviders.some((change) => change.service === GITHUB);
  let archivedTaskIds = [];
  if (changedGitHubIntegrations) {
    const repoChanges = await removeGitHubReposForUserId(userId, [teamId]);
    // TODO send the archived tasks in a mutation payload
    archivedTaskIds = await archiveTasksForManyRepos(repoChanges);
  }

  return {
    user,
    removedNotifications,
    notificationId,
    archivedTaskIds,
    reassignedTaskIds: reassignedTasks.map(({id}) => id)
  };
}
;

export default removeTeamMember;
