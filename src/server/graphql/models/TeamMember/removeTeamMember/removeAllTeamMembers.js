import {KICK_OUT, USER_MEMO} from 'universal/subscriptions/constants';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import getRethink from 'server/database/rethinkDriver';

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
        .filter({isArchived: false})
        .update((project) => ({
          teamMemberId: r.table('TeamMember')
            .getAll(project('teamId'), {index: 'teamId'})
            .filter({isLead: true, isNotRemoved: true})
            .nth(0)('id')
        }), {nonAtomic: true});
    })
    // flag all actions as complete since the user can't edit them now, anyways
    .do(() => {
      return r.table('Action')
        .getAll(r.args(teamMemberIds), {index: 'teamMemberId'})
        .update({
          isComplete: true
        });
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
  return true;
}
