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
    const {team, users, removedTeamNotifications} = await r({
      team: r.table('Team').get(teamId)
        .update({isArchived: true}, {returnChanges: true})('changes')(0)('new_val')
        .default(null),
      users: r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({isNotRemoved: true})('userId')
        .coerceTo('array')
        .do((userIds) => {
          return r.table('User')
            .getAll(r.args(userIds), {index: 'id'})
            .update((user) => ({tms: user('tms').difference([teamId])}), {returnChanges: true})('changes')('new_val')
            .default([]);
        }),
      removedTeamNotifications: r.table('Notification')
        // TODO index
        .filter({teamId})
        .delete({returnChanges: true})('changes')('new_val')
        .default([])
    });

    if (!team) {
      throw new Error('Team was already archived');
    }

    const notifications = users
      .map(({id}) => id)
      .filter((userId) => userId !== viewerId)
      .map((notifiedUserId) => ({
        id: shortid.generate(),
        startAt: now,
        type: TEAM_ARCHIVED,
        userIds: [notifiedUserId],
        teamId
      }));
    if (notifications.length) {
      await r.table('Notification').insert(notifications);
    }

    const data = {team, notifications, removedTeamNotifications};
    publish(TEAM, teamId, ArchiveTeamPayload, data, subOptions);

    users.forEach((user) => {
      const {id, tms} = user;
      auth0ManagementClient.users.updateAppMetadata({id}, {tms});
      publish(NEW_AUTH_TOKEN, id, UPDATED, {tms});
    });

    return data;
  }
};
