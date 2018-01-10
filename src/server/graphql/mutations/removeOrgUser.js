import {GraphQLID, GraphQLNonNull} from 'graphql';
import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import getRethink from 'server/database/rethinkDriver';
import removeTeamMember from 'server/graphql/mutations/helpers/removeTeamMember';
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {REMOVE_USER} from 'server/utils/serverConstants';
import {
  NEW_AUTH_TOKEN, NOTIFICATION, ORGANIZATION, PROJECT, TEAM, TEAM_MEMBER,
  UPDATED
} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

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
    const perTeamRes = await Promise.all(teamMemberIds.map((teamMemberId) => {
      return removeTeamMember(teamMemberId, {isKickout: true});
    }));

    const projectIds = perTeamRes.reduce((arr, res) => {
      arr.push(...res.archivedProjectIds, ...res.reassignedProjectIds);
      return arr;
    }, []);

    const removedTeamNotifications = perTeamRes.reduce((arr, res) => {
      arr.push(...res.removedNotifications);
      return arr;
    }, []);

    const {removedOrgNotifications, updatedUser} = await r({
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
      removedOrgNotifications: r.table('Notification')
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

    const data = {orgId, teamIds, teamMemberIds, projectIds, removedTeamNotifications, removedOrgNotifications, userId};

    publish(ORGANIZATION, orgId, RemoveOrgUserPayload, data, subOptions);
    publish(NOTIFICATION, userId, RemoveOrgUserPayload, data, subOptions);
    teamIds.forEach((teamId) => {
      const teamData = {...data, teamFilterId: teamId};
      publish(TEAM, teamId, RemoveOrgUserPayload, teamData, subOptions);
      publish(TEAM_MEMBER, teamId, RemoveOrgUserPayload, teamData, subOptions);
    });

    const remainingTeamMembers = await dataLoader.get('teamMembersByTeamId').loadMany(teamIds);
    remainingTeamMembers.forEach((teamMember) => {
      if (teamMemberIds.includes(teamMember.id)) return;
      publish(PROJECT, teamMember.userId, RemoveOrgUserPayload, data, subOptions);
    });
    return data;
  }
};

export default removeOrgUser;
