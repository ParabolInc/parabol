import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import ArchiveTeamPayload from 'server/graphql/types/ArchiveTeamPayload';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getUserId, requireTeamLead} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';
import shortid from 'shortid';
import {NEW_AUTH_TOKEN, TEAM, TEAM_ARCHIVED, UPDATED} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

const publishAuthTokensWithoutTeam = (userDocs) => {
  userDocs.forEach((user) => {
    const {id, tms} = user;
    auth0ManagementClient.users.updateAppMetadata({id}, {tms});
    publish(NEW_AUTH_TOKEN, id, UPDATED, {tms});
  });
};

export default {
  type: ArchiveTeamPayload,
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

    const team = {
      ...teamResult,
      isArchived: true
    };

    // tell the mutator, but don't give them a notification
    publish(TEAM, viewerId, ArchiveTeamPayload, {team}, subOptions);

    let notifications;
    if (notificationData) {
      const {team: {orgId}, userIds} = notificationData;
      notifications = userIds
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
    }

    const data = {team, notifications};
    publish(TEAM, teamId, ArchiveTeamPayload, data, subOptions);

    publishAuthTokensWithoutTeam(userDocs);

    return data;
  }
};
