import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import getRethink from 'server/database/rethinkDriver';
import {getUserId} from 'server/utils/authorization';
import {ADD_USER} from 'server/utils/serverConstants';
import {BILLING_LEADER} from 'universal/utils/constants';

export default {
  type: GraphQLString,
  description: 'Move a team to a different org. Requires billing leader rights on both orgs!',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId that you want to move'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the organization you want to move the team to'
    }
  },
  async resolve(source, {teamId, orgId}, {authToken}) {
    const r = getRethink();
    // AUTH
    const userId = getUserId(authToken);

    // VALIDATION
    const {user, team, org} = await r({
      user: r.table('User').get(userId),
      team: r.table('Team').get(teamId),
      org: r.table('Organization').get(orgId)
    });

    const {userOrgs} = user;
    const isBillingLeaderForOrg = userOrgs.find((userOrg) => userOrg.id === orgId && userOrg.role === BILLING_LEADER);
    if (!isBillingLeaderForOrg) {
      throw new Error('You must be a billing leader for the organization you want to move the team to', orgId);
    }
    const {orgId: currentOrgId} = team;
    const isBillingLeaderForTeam = userOrgs.find((userOrg) => userOrg.id === currentOrgId && userOrg.role === BILLING_LEADER);
    if (!isBillingLeaderForTeam) {
      throw new Error('You must be a billing leader for the org that owns that team', teamId);
    }

    if (orgId === currentOrgId) {
      throw new Error('That team already belongs to the organization', orgId);
    }

    // RESOLUTION
    const {newToOrgUserIds} = await r({
      notifications: r.table('Notification')
        .getAll(currentOrgId, {index: 'orgId'})
        .filter({teamId})
        .update({orgId}),
      orgApprovals: r.table('OrgApproval')
        .getAll(teamId, {index: 'teamId'})
        .update({orgId}),
      team: r.table('Team').get(teamId)
        .update({
          orgId,
          isPaid: Boolean(org.stripeSubscriptionId),
          tier: org.tier
        }),
      newToOrgUserIds: r.table('TeamMember').getAll(teamId, {index: 'teamId'})('userId')
        .coerceTo('array')
        .do((userIds) => {
          return r.table('User')
            .getAll(r.args(userIds), {index: 'id'})
            .filter((newUser) => newUser('userOrgs')
              .contains((userOrg) => userOrg('id').eq(orgId)).not().default(true)
            )('id');
        })
        .coerceTo('array')
    });

    // This part is untested. We should probably test this before we give it to users
    const inactiveNewToOrgUserIds = newToOrgUserIds.filter((t) => t.inactive);
    const activeNewToOrgUserIds = newToOrgUserIds.filter((t) => !t.inactive);
    await Promise.all(activeNewToOrgUserIds.map((newUserId) => {
      return adjustUserCount(newUserId, orgId, ADD_USER);
    }));

    await r(inactiveNewToOrgUserIds).forEach((newUserId) => {
      return r({
        user: r.table('User').get(newUserId).update((userRow) => ({
          userOrgs: userRow('userOrgs').add({id: orgId, role: null})
        })),
        org: r.table('Organization')
          .get(orgId)
          .update((orgRow) => ({
            orgUsers: orgRow('orgUsers').append({
              id: newUserId,
              inactive: true
            }),
            updatedAt: new Date()
          }))
      });
    });
    const inactiveAdded = inactiveNewToOrgUserIds.length;
    const activeAdded = activeNewToOrgUserIds.length;
    return `${inactiveAdded} inactive users and ${activeAdded} active users added to org ${orgId}`;
  }
};
