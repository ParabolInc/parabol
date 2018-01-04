import {GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString} from 'graphql';
import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import getRethink from 'server/database/rethinkDriver';
import removeTeamMember from 'server/graphql/mutations/helpers/removeTeamMember';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import getS3PutUrl from 'server/utils/getS3PutUrl';
import publish from 'server/utils/publish';
import {REMOVE_USER} from 'server/utils/serverConstants';
import {validateAvatarUpload} from 'server/utils/utils';
import shortid from 'shortid';
import {NEW_AUTH_TOKEN, UPDATED} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

export default {
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
      const perTeamRes = await Promise.all(teamMemberIds.map((teamMemberId) => {
        return removeTeamMember(teamMemberId, {isKickout: true});
      }));

      const projectIds = perTeamRes.reduce((arr, res) => {
        arr.push(...res.archivedProjectIds, ...res.reassignedProjectIds);
        return arr;
      }, []);

      //const removedTeamNotifications = perTeamRes.reduce((arr, res) => {
      //  arr.push(...res.removedNotifications);
      //  return arr;
      //}, []);

      const {updatedUser} = await r({
        updatedOrg: r.table('Organization').get(orgId)
          .update((org) => ({
            orgUsers: org('orgUsers').filter((orgUser) => orgUser('id').ne(userId)),
            updatedAt: now
          })),
        updatedUser: r.table('User').get(userId)
          .update((row) => ({
            userOrgs: row('userOrgs').filter((userOrg) => userOrg('id').ne(orgId)),
            updatedAt: now
          }), {returnChanges: true})('changes')(0)('new_val')
          .default(null),
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

      const {tms} = updatedUser;
      publish(NEW_AUTH_TOKEN, userId, UPDATED, {tms});
      auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms});

      const data = {teamIds, teamMemberIds, projectIds, orgId, userId};

      // Kick this guy out of the org
      // TODO incorporate removedOrgNotifications
      // TODO move this to Relay
      return true;
      //publish(ORGANIZATION, userId, RemoveOrgUserPayload, data, subOptions);
      //
      //// tell the org members that 1 got kicked out
      //publish(ORGANIZATION, orgId, RemoveOrgUserPayload, data, subOptions);
      //
      //perTeamRes.forEach((res) => {
      //  const {teamId} = res;
      //  // tel the team members that 1 got removed
      //  publish(TEAM_MEMBER, teamId, RemoveOrgUserPayload, data, subOptions);
      //
      //  // tell the project teams that the projects changed
      //  publish(PROJECT, teamId, RemoveOrgUserPayload, data, subOptions);
      //});
      //return {removedNotifications: removedTeamNotifications, projectIds, teamIds, teamMemberIds, orgId};
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
