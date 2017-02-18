import getRethink from '../../database/rethinkDriver';

export default function cleanupTeamAndOrg(teamLeader, teamMembers, expectedRowsCreated) {
  describe('cleanup', () => {
    const ALL_TEAM_MEMBERS = [teamLeader, ...teamMembers];
    test('count rows and delete org1 test data', async() => {
      const r = getRethink();
      // how many rows in the database?
      const preDeleteRowCount = await r.db('actionTesting').tableList()
        .map((tableName) =>
          r.db('actionTesting').table(tableName).count()
        )
        .sum();
      const dbWork = [
        r.expr(teamMembers.map((tm) => tm.auth0UserInfo.email))
          .forEach((email) => r.table('Invitation').filter({email}).delete()),
        r.expr(teamMembers.map((tm) => tm.id))
          .forEach((userId) => r.table('InvoiceItemHook').filter({userId}).delete()),
        r.table('Notification')
          .getAll(teamLeader.id, {index: 'userIds'}).delete(),
        r.table('Organization')
          .getAll(teamLeader.id, {index: 'orgUsers'})
          .nth(0)
          .do((org) =>
            r.db('actionTesting').table('Team')
              .getAll(org('id'), {index: 'orgId'})
              .delete()
          ),
        r.table('Organization')
          .getAll(teamLeader.id, {index: 'orgUsers'}).delete(),
        r.table('TeamMember')
          .getAll(teamLeader.id, {index: 'userId'})
          .pluck('teamId', 'userId')
          .nth(0)
          .do((tm) =>
            r.db('actionTesting').table('Project')
              .getAll(r.add(tm('userId'), '::', tm('teamId')), {index: 'teamMemberId'})
              .delete()
          ),
        r.table('TeamMember')
          .getAll(teamLeader.id, {index: 'userId'})
          .pluck('teamId', 'userId')
          .nth(0)
          .do((tm) =>
            r.db('actionTesting').table('ProjectHistory')
              .filter({teamMemberId: r.add(tm('userId'), '::', tm('teamId'))})
              .delete()
          ),
        r.table('TeamMember')
          .getAll(...ALL_TEAM_MEMBERS.map((tm) => tm.id),
            {index: 'userId'})
          .delete(),
        r.table('User')
          .getAll(...ALL_TEAM_MEMBERS.map((tm) => tm.id),
            {index: 'id'})
          .delete()
      ];
      await Promise.all(dbWork);
      const postDeleteRowCount = await r.db('actionTesting').tableList()
        .map((tableName) =>
          r.db('actionTesting').table(tableName).count()
        )
        .sum();
      return expect(preDeleteRowCount - postDeleteRowCount).toBe(expectedRowsCreated);
    });
  });
}
