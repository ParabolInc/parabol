import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import UpdateTeamPayload from 'server/graphql/types/UpdateTeamPayload';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getUserId, requireTeamLead} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import publish from 'server/utils/publish';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import shortid from 'shortid';
import {NEW_AUTH_TOKEN, REMOVED, TEAM, TEAM_ARCHIVED, UPDATED} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

const publishAuthTokensWithoutTeam = (userDocs) => {
  userDocs.forEach((user) => {
    const {id, tms} = user;
    auth0ManagementClient.users.updateAppMetadata({id}, {tms});
    publish(NEW_AUTH_TOKEN, id, UPDATED, {tms});
  });
};

const publishTeamArchivedNotifications = (notifications, team, subOptions) => {
  notifications.forEach((notification) => {
    const {id: notificationId, userIds} = notification;
    const userId = userIds[0];
    getPubSub().publish(`${TEAM}.${userId}`, {data: {team, type: REMOVED, notificationId}, ...subOptions});
  });
};

export default {
  type: UpdateTeamPayload,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId to archive (or delete, if team is unused)'
    }
  },
  async resolve(source, {teamId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {operationId, mutatorId};
    // AUTH
    const viewerId = getUserId(authToken);
    const teamMemberId = toTeamMemberId(teamId, viewerId);
    await requireTeamLead(teamMemberId);

    // RESOLUTION
    sendSegmentEvent('Archive Team', viewerId, {teamId});
    const {teamResults: {notificationData, teamResult}, userDocs} = await r.table('Team')
      .get(teamId)
      .pluck('name', 'orgId')
      .do((team) => ({
        projectCount: r.table('Project').getAll(teamId, {index: 'teamId'}).count(),
        team,
        userIds: r.table('TeamMember')
          .getAll(teamId, {index: 'teamId'})
          .filter({isNotRemoved: true})('userId')
          .coerceTo('array')
      }))
      .do((doc) => ({
        userDocs: r.table('User')
          .getAll(r.args(doc('userIds')), {index: 'id'})
          .update((user) => ({tms: user('tms').difference([teamId])}), {returnChanges: true})('changes')('new_val')
          .pluck('id', 'tms')
          .default([]),
        teamName: doc('team')('name'),
        teamResults: r.branch(
          r.and(doc('projectCount').eq(0), doc('userIds').count().eq(1)),
          {
            // Team has no projects nor addn'l TeamMembers, hard delete it:
            teamResult: r.table('Team').get(teamId)
              .delete({returnChanges: true})('changes')(0)('old_val').default(null),
            teamMemberResult: r.table('TeamMember').getAll(teamId, {index: 'teamId'}).delete()
          },
          {
            notificationData: doc,
            teamResult: r.table('Team').get(teamId)
              .update({isArchived: true}, {returnChanges: true})('changes')(0)('new_val')
              .default(null)
          }
        )
      }));

    if (!teamResult) {
      throw new Error('Team was already archived');
    }

    // the client doesn't care whether we hard deleted or archived. just tell them we archived so it removes from list
    const team = {
      ...teamResult,
      isArchived: true
    };

    // tell the mutator, but don't give them a notification
    getPubSub().publish(`${TEAM}.${viewerId}`, {data: {team, type: REMOVED}, ...subOptions});

    if (notificationData) {
      const {team: {orgId}, userIds} = notificationData;
      const notifications = userIds
        .filter((userId) => userId !== viewerId)
        .map((notifiedUserId) => ({
          id: shortid.generate(),
          orgId,
          startAt: now,
          type: TEAM_ARCHIVED,
          userIds: [notifiedUserId],
          teamId
        }));
      await r.table('Notification').insert(notifications);
      publishTeamArchivedNotifications(notifications, team, subOptions);
    }
    publishAuthTokensWithoutTeam(userDocs);

    return {team};
  }
};
