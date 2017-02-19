import getRethink from '../../database/rethinkDriver';

export default function cleanupTeamAndOrg(teamLeader, teamMembers) {
  describe('cleanup org data', () => {
    test('count rows and purge', async() => {
      const r = getRethink();

      const affect = await r.table('User').get(teamLeader.id)
        .do((user) =>
          r.table('Organization').get(user('userOrgs').nth(0)('id'))
        )
        .do((org) => ({
          orgId: org('id'),
          userIds: org('orgUsers').map((ou) => ou('id'))
        }))
        .do((res) => ({
          orgId: res('orgId'),
          userIds: res('userIds'),
          teamIds: r.table('User').getAll(r.args(res('userIds')))
            .coerceTo('array')
            .map((user) => user('tms'))
            .reduce((left, right) => left.append(r.args(right)))
            .distinct()
        }))
        .do((res) => ({
          orgId: res('orgId'),
          userIds: res('userIds'),
          teamIds: res('teamIds'),
          teamMemberIds: res('userIds').concatMap((userId) =>
            res('teamIds').map((teamId) => r.add(userId, '::', teamId))
          )
        }));

      const dbWork = [
        r.table('Invitation').getAll(...affect.teamIds, {index: 'teamId'}).delete(),
        r.table('InvoiceItemHook').getAll(...affect.userIds, {index: 'userId'}).delete(),
        r.table('Notification').getAll(affect.orgId, {index: 'orgId'}).delete(),
        r.table('Organization').get(affect.orgId).delete(),
        r.table('Project').getAll(...affect.teamMemberIds, {index: 'teamMemberId'}).delete(),
        r.table('ProjectHistory').getAll(...affect.teamMemberIds, {index: 'teamMemberId'}).delete(),
        r.table('Team').getAll(affect.orgId, {index: 'orgId'}).delete(),
        r.table('TeamMember').getAll(...affect.teamMemberIds).delete(),
        r.table('User').getAll(...affect.userIds).delete()
      ];
      await Promise.all(dbWork);

      const numTeamMembers = teamMembers.length + 1;
      expect(affect.userIds.length).toBe(numTeamMembers);
      expect(affect.teamIds.length).toBe(1);
      expect(affect.teamMemberIds.length).toBe(numTeamMembers);
    });
  });
}
