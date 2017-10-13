import {GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString} from 'graphql';
import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import getRethink from 'server/database/rethinkDriver';
import rejectOrgApproval from 'server/graphql/models/Organization/rejectOrgApproval/rejectOrgApproval';
import removeAllTeamMembers from 'server/graphql/models/TeamMember/removeTeamMember/removeAllTeamMembers';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';
import {getUserId, getUserOrgDoc, requireOrgLeader, requireWebsocket} from 'server/utils/authorization';
import getS3PutUrl from 'server/utils/getS3PutUrl';
import {REMOVE_USER} from 'server/utils/serverConstants';
import {validateAvatarUpload} from 'server/utils/utils';
import shortid from 'shortid';

export default {
  rejectOrgApproval,
  removeOrgUser: {
    type: GraphQLBoolean,
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
    async resolve(source, {orgId, userId}, {authToken, socket}) {
      const r = getRethink();
      const now = new Date();

      // AUTH
      requireWebsocket(socket);
      const userOrgDoc = await getUserOrgDoc(authToken.sub, orgId);
      requireOrgLeader(userOrgDoc);

      // RESOLUTION
      const teamIds = await r.table('Team')
        .getAll(orgId, {index: 'orgId'})('id');
      const teamMemberIds = teamIds.map((teamId) => `${userId}::${teamId}`);
      await removeAllTeamMembers(teamMemberIds, {isKickout: true});
      await r({
        updatedOrg: r.table('Organization').get(orgId)
          .update((org) => ({
            orgUsers: org('orgUsers').filter((orgUser) => orgUser('id').ne(userId)),
            updatedAt: now
          })),
        updatedUser: r.table('User').get(userId)
          .update((row) => ({
            userOrgs: row('userOrgs').filter((userOrg) => userOrg('id').ne(orgId)),
            updatedAt: now
          })),
        // remove stale notifications
        // TODO I think this may be broken. see #1334
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
              });
          })
      });
      // need to make sure the org doc is updated before adjusting this
      await adjustUserCount(userId, orgId, REMOVE_USER);
      return true;
    }
  },
  createOrgPicturePutUrl: {
    type: GraphQLURLType,
    description: 'Create a PUT URL on the CDN for an organization’s profile picture',
    args: {
      contentType: {
        type: GraphQLString,
        description: 'user-supplied MIME content type'
      },
      contentLength: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'user-supplied file size'
      },
      orgId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The organization id to update'
      }
    },
    async resolve(source, {orgId, contentType, contentLength}, {authToken}) {
      // AUTH
      const userId = getUserId(authToken);
      const userOrgDoc = await getUserOrgDoc(userId, orgId);
      requireOrgLeader(userOrgDoc);

      // VALIDATION
      const ext = validateAvatarUpload(contentType, contentLength);

      // RESOLUTION
      const partialPath = `Organization/${orgId}/picture/${shortid.generate()}.${ext}`;
      return getS3PutUrl(contentType, contentLength, partialPath);
    }
  }
};
