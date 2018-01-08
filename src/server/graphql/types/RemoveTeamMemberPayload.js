import {GraphQLList, GraphQLObjectType} from 'graphql';
import {
  makeResolveNotificationsForViewer,
  resolveProjects,
  resolveTeam,
  resolveTeamMember,
  resolveUser
} from 'server/graphql/resolvers';
import Notification from 'server/graphql/types/Notification';
import NotifyKickedOut from 'server/graphql/types/NotifyKickedOut';
import Project from 'server/graphql/types/Project';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';
import User from 'server/graphql/types/User';
import {getUserId} from 'server/utils/authorization';


const RemoveTeamMemberPayload = new GraphQLObjectType({
  name: 'RemoveTeamMemberPayload',
  fields: () => ({
    teamMember: {
      type: TeamMember,
      description: 'The team member removed',
      resolve: resolveTeamMember
    },
    team: {
      type: Team,
      description: 'The team the team member was removed from',
      resolve: resolveTeam
    },
    updatedProjects: {
      type: new GraphQLList(Project),
      description: 'The projects that got reassigned',
      resolve: resolveProjects
    },
    user: {
      type: User,
      description: 'The user removed from the team',
      resolve: resolveUser
    },
    removedNotifications: {
      type: new GraphQLList(Notification),
      description: 'Any notifications pertaining to the team that are no longer relevant',
      resolve: makeResolveNotificationsForViewer('', 'removedNotifications')
    },
    kickOutNotification: {
      type: NotifyKickedOut,
      description: 'A notification if you were kicked out by the team leader',
      resolve: async ({notificationId}, args, {authToken, dataLoader}) => {
        if (!notificationId) return null;
        const viewerId = getUserId(authToken);
        const notification = await dataLoader.get('notifications').load(notificationId);
        return notification.userIds[0] === viewerId ? notification : null;
      }
    }
  })
});

export default RemoveTeamMemberPayload;
