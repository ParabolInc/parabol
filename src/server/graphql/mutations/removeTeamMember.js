import {GraphQLID, GraphQLNonNull} from 'graphql';
import removeTeamMember from 'server/graphql/mutations/helpers/removeTeamMember';
import RemoveTeamMemberPayload from 'server/graphql/types/RemoveTeamMemberPayload';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getUserId, requireTeamLead} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {NEW_AUTH_TOKEN, PROJECT, TEAM, TEAM_MEMBER, UPDATED} from 'universal/utils/constants';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

export default {
  type: RemoveTeamMemberPayload,
  description: 'Remove a team member from the team',
  args: {
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamMemberId of the person who is being removed'
    }
  },
  async resolve(source, {teamMemberId}, {authToken, dataLoader, socketId: mutatorId}) {
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    const viewerId = getUserId(authToken);
    const {userId, teamId} = fromTeamMemberId(teamMemberId);
    const isSelf = viewerId === userId;
    if (!isSelf) {
      const myTeamMemberId = toTeamMemberId(teamId, viewerId);
      await requireTeamLead(myTeamMemberId);
    }

    // RESOLUTION
    const isKickout = !isSelf;
    const res = await removeTeamMember(teamMemberId, {isKickout});
    const {user, removedNotifications, notificationId, archivedProjectIds, reassignedProjectIds} = res;
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId);
    const {tms} = user;
    publish(NEW_AUTH_TOKEN, userId, UPDATED, {tms});
    auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms});

    const projectIds = [...archivedProjectIds, ...reassignedProjectIds];
    const data = {teamId, teamMemberId, projectIds, notificationId, removedNotifications, userId};
    // messages to the rest of the team reporting the kick out
    publish(TEAM_MEMBER, teamId, RemoveTeamMemberPayload, data, subOptions);
    teamMembers.forEach(({teamMemberUserId}) => {
      // don't send updated projects to the person being kicked out
      if (teamMemberUserId === userId) return;
      publish(PROJECT, teamMemberUserId, RemoveTeamMemberPayload, data, subOptions);
    });

    // individualized message to the user getting kicked out
    publish(TEAM, userId, RemoveTeamMemberPayload, data, subOptions);

    return data;
  }
};
