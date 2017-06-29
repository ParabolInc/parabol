import {KICK_OUT, USER_MEMO} from 'universal/subscriptions/constants';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import getRethink from 'server/database/rethinkDriver';
import serviceToProvider from 'server/utils/serviceToProvider';
import {getServiceFromId} from 'universal/utils/integrationIds';

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
  const changedIntegrations = await r.table('Provider')
    .getAll(r.args(teamIds), {index: 'teamIds'})
    .filter({userId})
    .update((doc) => ({
      teamIds: doc('teamIds').filter((teamId) => r.expr(teamIds).contains(teamId).not())
    }), {returnChanges: true})('changes')
    .forEach((change) => {
      const table = r.expr(serviceToProvider)(change('new_val')('service'));
      return r.table(table)
        .getAll(userId, {index: 'userIds'})
        .filter((doc) => r.expr(teamIds).contains(doc('teamId')))
        .update((doc) => ({
          userIds: doc('userIds').difference([userId]),
          isActive: doc('userIds').count().ne(0)
        }), {returnChanges: true})('changes');

      // look for all integrations for this user for any of these teams
    });
  //changedIntegrations.forEach((integration) => {
  //  const {id, isActive} = integration.new_val;
  //  if (!isActive) {
  //    const service = getServiceFromId(id);
  //    if (service === GITHUB) {
  //      // TODO archive all the things
  //    }
  //  }
  //
  //})
  return true;
}
