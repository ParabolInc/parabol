import {GraphQLID, GraphQLNonNull} from 'graphql';
import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import getRethink from 'server/database/rethinkDriver';
import removeAllTeamMembers from 'server/graphql/models/TeamMember/removeTeamMember/removeAllTeamMembers';
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload';
import {getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {REMOVE_USER} from 'server/utils/serverConstants';
import {NOTIFICATIONS_CLEARED, ORG_APPROVAL_REMOVED, ORGANIZATION_UPDATED} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

const publishInactivatedApprovals = (inactivatedOrgApprovals, subOptions) => {
  inactivatedOrgApprovals.forEach((orgApproval) => {
    const {teamId} = orgApproval;
    const orgApprovalRemoved = {orgApproval};
    getPubSub().publish(`${ORG_APPROVAL_REMOVED}.${teamId}`, {orgApprovalRemoved, ...subOptions});
  });
};

const publishRemovedNotifications = (removedNotifications, userId, subOptions) => {
  const deletedIds = removedNotifications.map(({id}) => id);
  const notificationsCleared = {deletedIds};
  getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${userId}`, {notificationsCleared, ...subOptions});
};

const publishOrgUpdates = (organization, removedOrgUser, subOptions) => {
  const {id: orgId} = organization;
  const organizationUpdated = {
    organization,
    removedOrgUser
  };
  getPubSub().publish(`${ORGANIZATION_UPDATED}.${orgId}`, {organizationUpdated, ...subOptions});
};

const removeOrgUser = {
  type: RemoveOrgUserPayload,
  description: 'Remove a user from an org',
  args: {
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the user to remove'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org that does not want them anymore'
    }
  },
  async resolve(source, {orgId, userId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};
    // AUTH
    const userOrgDoc = await getUserOrgDoc(authToken.sub, orgId);
    requireOrgLeader(userOrgDoc);

    // RESOLUTION
    const teamIds = await r.table('Team')
      .getAll(orgId, {index: 'orgId'})('id');
    const teamMemberIds = teamIds.map((teamId) => toTeamMemberId(teamId, userId));
    const teamMembersRemoved = await removeAllTeamMembers(teamMemberIds, {isKickout: true}, subOptions);
    const {updatedOrg, updatedUser, inactivatedOrgApprovals, removedNotifications: {notifications}} = await r({
      updatedOrg: r.table('Organization').get(orgId)
        .update((org) => ({
          orgUsers: org('orgUsers').filter((orgUser) => orgUser('id').ne(userId)),
          updatedAt: now
        }), {returnChanges: true})('changes')(0)('new_val').default(null),
      updatedUser: r.table('User').get(userId)
        .update((row) => ({
          userOrgs: row('userOrgs').filter((userOrg) => userOrg('id').ne(orgId)),
          updatedAt: now
        }), {returnChanges: true})('changes')(0)('new_val').default(null),
      removedNotifications: r.table('Notification')
        .getAll(userId, {index: 'userIds'})
        .filter({orgId})
        .update((notification) => ({
          // if this was for many people, remove them from it
          userIds: notification('userIds').filter((id) => id.ne(userId))
        }), {returnChanges: true})('changes')('new_val').default([])
        .do((allNotifications) => {
          return {
            notifications: allNotifications,
            // if this was for them, delete it
            deletions: r.table('Notification').getAll(r.args(allNotifications('id')), {index: 'id'})
              .filter((notification) => notification('userIds').count().eq(0))
              .delete()
          };
        }),
      inactivatedOrgApprovals: r.table('User').get(userId)('email')
        .do((email) => {
          return r.table('OrgApproval')
            .getAll(email, {index: 'email'})
            .filter({orgId})
            .update({
              isActive: false
            }, {returnChanges: true})('changes')('new_val').default([]);
        })
    });
    publishRemovedNotifications(notifications, userId, subOptions);
    publishInactivatedApprovals(inactivatedOrgApprovals, subOptions);
    publishOrgUpdates(updatedOrg, updatedUser, subOptions);
    // need to make sure the org doc is updated before adjusting this
    await adjustUserCount(userId, orgId, REMOVE_USER);
    return {
      organization: updatedOrg,
      inactivatedOrgApprovals,
      teamMembersRemoved
    };
  }
};

export default removeOrgUser;
