import {GraphQLObjectType} from 'graphql';
import NotifyTeamArchived from 'server/graphql/types/NotifyTeamArchived';
import Team from 'server/graphql/types/Team';
import {getUserId} from 'server/utils/authorization';

const ArchiveTeamPayload = new GraphQLObjectType({
  name: 'ArchiveTeamPayload',
  fields: () => ({
    team: {
      type: Team
    },
    notification: {
      type: NotifyTeamArchived,
      description: 'A notification explaining that the team was archived and removed from view',
      resolve: ({teamArchivedNotifications}, args, {authToken}) => {
        const viewerId = getUserId(authToken);
        return teamArchivedNotifications.find((n) => n.userIds[0] === viewerId);
      }
    }
  })
});

export default ArchiveTeamPayload;
