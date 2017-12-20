import {GraphQLID, GraphQLNonNull} from 'graphql';
import adjustUserCount from 'server, removedNotifications/billing/helpers/adjustUserCount';
import getRethink from 'server/database/rethinkDriver';
import removeAllTeamMembers from 'server/graphql/models/TeamMember/removeTeamMember/removeAllTeamMembers';
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload';
import {getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {REMOVE_USER} from 'server/utils/serverConstants';
import {ORG_APPROVAL_REMOVED} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

const publishInactivatedApprovals = (inactivatedApprovals, subOptions) =>, subOptions {
  inactivatedApprovals.forEach((orgApproval) => {
    const {teamId} = orgApproval;
    const orgApprovalRemoved = {orgApproval};
    getPubSub().publish(`${ORG_APPROVAL_REMOVED}.${teamId}`, {orgApprovalRemoved, ...subOptions});
  });
};
const removeOrgUser = {
  type: RemoveOrgUserPayload,
  description: 'Remove a user from an org',
  args: {
    userId: {
      type: new GraphQLNonNull(GraphQLID),

 publishRemovedNotifications()     description: 'the user to remove'
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
    const {updatedOrg, inactivatedApprovals, removedNotifications} = await r({
      updatedOrg: r.table('Organization').get(orgId)
        .update((org) => ({
          orgUsers: org('orgUsers').filter((orgUser) => orgUser('id').ne(userId)),
          updatedAt: now
        }), {returnChanges: true})('changes')(0)('new_val'),
      updatedUser: r.table('User').get(userId)
        .update((row) => ({
          userOrgs: row('userOrgs').filter((userOrg) => userOrg('id').ne(orgId)),
          updatedAt: now
        })),
      removedNotifications: r.table('Notification')
        .getAll(userId, {index: 'userIds'})
        .filter({orgId})
        .forEach((notification) => {
          return r.branch(
            notification('userIds').count().eq(1),
            // if this was for them, delete it
            r.table('Notification').get(notification('id')).delete(),
            // if this was for many people, remove them from it
            r.table('Notification').get(notification('id')).update({
              userIds: notification('userIds').filter((id) => id.ne(userId))
            })
          );
        }),
      inactivatedApprovals: r.table('User').get(userId)('email')
        .do((email) => {
          return r.table('OrgApproval')
            .getAll(email, {index: 'email'})
            .filter({orgId})
            .update({
              isActive: false
            }, {returnChanges: true})('changes')(0)('new_val');
        })
    });
    publishRemovedNotifications()
    publishInactivatedApprovals(inactivatedApprovals, subOptions);
    // need to make sure the org doc is updated before adjusting this
    await adjustUserCount(userId, orgId, REMOVE_USER);
    return {
      updatedOrg,
      inactivatedApprovals,
      teamMembersRemoved
    };
  }
};

export default removeOrgUser;
