import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
} from 'graphql';
import {
  getUserId,
  getUserOrgDoc,
  requireOrgLeader,
  requireOrgLeaderOfUser,
  requireWebsocket
} from 'server/utils/authorization';
import {errorObj, validateAvatarUpload} from 'server/utils/utils';
import getS3PutUrl from 'server/utils/getS3PutUrl';
import {
  PAUSE_USER,
  REMOVE_USER,
  MAX_MONTHLY_PAUSES
} from 'server/utils/serverConstants';
import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import {GraphQLURLType} from '../../types';
import shortid from 'shortid';
import addOrg from 'server/graphql/models/Organization/addOrg/addOrg';
import addBilling from 'server/graphql/models/Organization/addBilling/addBilling';
import extendTrial from 'server/graphql/models/Organization/extendTrial/extendTrial';
import updateOrg from 'server/graphql/models/Organization/updateOrg/updateOrg';
import rejectOrgApproval from 'server/graphql/models/Organization/rejectOrgApproval/rejectOrgApproval';
import {BILLING_LEADER, PROMOTE_TO_BILLING_LEADER, billingLeaderTypes} from 'universal/utils/constants';
import {toEpochSeconds} from 'server/utils/epochTime';
import removeAllTeamMembers from 'server/graphql/models/TeamMember/removeTeamMember/removeAllTeamMembers';

export default {
  updateOrg,
  addBilling,
  extendTrial,
  inactivateUser: {
    type: GraphQLBoolean,
    description: 'pauses the subscription for a single user',
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the user to pause'
      }
    },
    async resolve(source, {userId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      await requireOrgLeaderOfUser(authToken, userId);
      const orgDocs = await r.table('Organization')
        .getAll(userId, {index: 'orgUsers'})
        .pluck('id', 'orgUsers', 'periodStart', 'periodEnd', 'stripeSubscriptionId');
      const firstOrgUser = orgDocs[0].orgUsers.find((orgUser) => orgUser.id === userId);
      if (!firstOrgUser) {
        // no userOrgs means there were no changes, which means inactive was already true
        throw errorObj({_error: 'That user is already inactive. cannot inactivate twice'});
      }
      const hookPromises = orgDocs.map((orgDoc) => {
        const {periodStart, periodEnd, stripeSubscriptionId} = orgDoc;
        const periodStartInSeconds = toEpochSeconds(periodStart);
        const periodEndInSeconds = toEpochSeconds(periodEnd);
        return r.table('InvoiceItemHook')
          .between(periodStartInSeconds, periodEndInSeconds, {index: 'prorationDate'})
          .filter({
            stripeSubscriptionId,
            type: PAUSE_USER,
            userId,
          })
          .count()
          .run();
      });
      const pausesByOrg = await Promise.all(hookPromises);
      const triggeredPauses = Math.max(...pausesByOrg);
      if (triggeredPauses >= MAX_MONTHLY_PAUSES) {
        throw errorObj({_error: 'Max monthly pauses exceeded for this user'});
      }

      // RESOLUTION
      await r.table('Organization')
        .getAll(userId, {index: 'orgUsers'})
        .update((org) => ({
          orgUsers: org('orgUsers').map((orgUser) => {
            return r.branch(
              orgUser('id').eq(userId),
              orgUser.merge({
                inactive: true
              }),
              orgUser
            );
          })
        }))
        .do(() => {
          return r.table('User')
            .get(userId)
            .update({
              inactive: true
            });
        });
      const orgIds = orgDocs.map((doc) => doc.id);
      await adjustUserCount(userId, orgIds, PAUSE_USER);
      return true;
    }
  },
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
    async resolve(source, {orgId, userId}, {authToken, exchange, socket}) {
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
      await removeAllTeamMembers(teamMemberIds, exchange);
      await r.table('Organization').get(orgId)
        .update((org) => ({
          orgUsers: org('orgUsers').filter((orgUser) => orgUser('id').ne(userId)),
          updatedAt: now
        }))
        .do(() => {
          return r.table('User').get(userId)
            .update((row) => ({
              userOrgs: row('userOrgs').filter((userOrg) => userOrg('id').ne(orgId)),
              updatedAt: now
            }));
        })
        .do(() => {
          // remove stale notifications
          return r.table('Notification')
            .getAll(userId, {index: 'userIds'})
            .filter({orgId})
            .forEach((notification) => {
              return r.branch(
                notification('userIds').count().eq(1),
                // if this was for them, delete it
                notification.delete(),
                // if this was for many people, remove them from it
                notification.update({
                  userIds: notification('userIds').filter((id) => id.ne(userId))
                })
              );
            });
        });
      // need to make sure the org doc is updated before adjusting this
      await adjustUserCount(userId, orgId, REMOVE_USER);
      return true;
    }
  },
  createOrgPicturePutUrl: {
    type: GraphQLURLType,
    description: 'Create a PUT URL on the CDN for an organization\'s profile picture',
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
  },
  addOrg,
  setOrgUserRole: {
    type: GraphQLBoolean,
    description: 'Set the role of a user',
    args: {
      orgId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The org to affect'
      },
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the user who is receiving a role change'
      },
      role: {
        type: GraphQLString,
        description: 'the user\'s new role'
      }
    },
    async
    resolve(source, {orgId, userId, role}, {authToken}) {
      const r = getRethink();
      const now = new Date();

      // AUTH
      const userOrgDoc = await getUserOrgDoc(authToken.sub, orgId);
      requireOrgLeader(userOrgDoc);

      // VALIDATION
      if (role && role !== BILLING_LEADER) {
        throw errorObj({_error: 'invalid role'});
      }
      // if someone is leaving, make sure there is someone else to take their place
      if (userId === authToken.sub) {
        const leaderCount = await r.table('Organization').get(orgId)('orgUsers')
          .filter({
            role: BILLING_LEADER
          })
          .count();
        if (leaderCount === 1) {
          throw errorObj({_error: 'You\'re the last leader, you can\'t give that up'});
        }
      }

      // RESOLUTION
      const orgName = await r.table('User').get(userId)
          .update((user) => ({
            userOrgs: user('userOrgs').map((userOrg) => {
              return r.branch(
                userOrg('id').eq(orgId),
                userOrg.merge({
                  role
                }),
                userOrg
              );
            }),
            updatedAt: now
          }))
          .do(() => {
            return r.table('Organization').get(orgId)
              .update((org) => ({
                orgUsers: org('orgUsers').map((orgUser) => {
                  return r.branch(
                    orgUser('id').eq(userId),
                    orgUser.merge({
                      role
                    }),
                    orgUser
                  );
                }),
                updatedAt: now
              }), {returnChanges: true})('changes')(0)('old_val')('name').default(null);
          });
      if (role === BILLING_LEADER) {
        // add a notification
        await r.table('Notification').insert({
          id: shortid.generate(),
          type: PROMOTE_TO_BILLING_LEADER,
          startAt: now,
          orgId,
          userIds: [userId],
          varList: [orgName]
        })
            .do(() => {
              return r.table('Notification')
                .getAll(orgId, {index: 'orgId'})
                .filter((notification) => r.expr(billingLeaderTypes).contains(notification('type')))
                .update((notification) => ({
                  userIds: notification('userIds').append(userId)
                }));
            });
      } else if (role === null) {
        await r.table('Notification')
            .getAll(userId, {index: 'userIds'})
            .filter({
              orgId,
              type: PROMOTE_TO_BILLING_LEADER
            })
            .delete()
            .do(() => {
              return r.table('Notification')
                .getAll(orgId, {index: 'orgId'})
                .filter((notification) => r.expr(billingLeaderTypes).contains(notification('type')))
                .update((notification) => ({
                  userIds: notification('userIds').filter((id) => id.ne(userId))
                }));
            });
      }
      return true;
    }
  }
};
