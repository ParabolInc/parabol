import getRethink from 'server/database/rethinkDriver';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {KICK_OUT, USER_MEMO} from 'universal/subscriptions/constants';
import {GITHUB} from 'universal/utils/constants';
import archiveProjectsForManyRepos from 'server/safeMutations/archiveProjectsForManyRepos';
import removeGitHubReposForUserId from 'server/safeMutations/removeGitHubReposForUserId';
// import serviceToProvider from 'server/utils/serviceToProvider';
// import {getServiceFromId} from 'universal/utils/integrationIds';

export default async function removeAllTeamMembers(maybeTeamMemberIds, exchange) {
  const r = getRethink();
  const now = new Date();
  const teamMemberIds = Array.isArray(maybeTeamMemberIds) ? maybeTeamMemberIds : [maybeTeamMemberIds];
  const userId = teamMemberIds[0].substr(0, teamMemberIds[0].indexOf('::'));
  const teamIds = teamMemberIds.map((teamMemberId) => teamMemberId.substr(teamMemberId.indexOf('::') + 2));
  // see if they were a leader, make a new guy leader so later we can reassign projects
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

  // assign active projects to the team lead
  const newtms = await r.table('TeamMember')
    .getAll(r.args(teamMemberIds), {index: 'id'})
    .update({
      // inactivate
      isNotRemoved: false,
      updatedAt: now
    })
    .do(() => {
      return r.table('Project')
        .getAll(r.args(teamMemberIds), {index: 'teamMemberId'})
        .filter((project) => project('tags').contains('archived').not())
        .update((project) => ({
          teamMemberId: r.table('TeamMember')
            .getAll(project('teamId'), {index: 'teamId'})
            .filter({isLead: true, isNotRemoved: true})
            .nth(0)('id')
        }), {nonAtomic: true});
    })
    // remove the teamId from the user tms array
    .do(() => {
      return r.table('User')
        .getAll(userId)
        .update((user) => {
          return user.merge({
            tms: user('tms').filter((teamId) => r.expr(teamIds).contains(teamId).not())
          });
        }, {returnChanges: true})('changes')(0)('new_val')('tms').default(null);
    });
  // update the tms on auth0 in async
  if (newtms) {
    auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms: newtms});
  }

  // we have to do this because the client may have already unsubscribed & cleared the team name from the client cache
  const teams = await r.table('Team').getAll(r.args(teamIds), {index: 'id'}).pluck('id', 'name');
  teams.forEach((team) => {
    // update the server socket, if they're logged in
    const {id: teamId, name: teamName} = team;
    const channel = `${USER_MEMO}/${userId}`;
    exchange.publish(channel, {type: KICK_OUT, teamId, teamName});
  });

  // TODO on the frontend, pop a warning if this is the last guy
  const changedProviders = await r.table('Provider')
    .getAll(r.args(teamIds), {index: 'teamId'})
    .filter({userId, isActive: true})
    .update({
      isActive: false
    }, {returnChanges: true})('changes').default([]);

  const changedGitHubIntegrations = changedProviders.some((change) => change.new_val.service === GITHUB);
  if (changedGitHubIntegrations) {
    const repoChanges = removeGitHubReposForUserId(userId, teamIds);
    // TODO send the archived projects in a mutation payload
    await archiveProjectsForManyRepos(repoChanges);
  }
  return true;
}
