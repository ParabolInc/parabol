import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {Team} from 'server/graphql/models/Team/teamSchema';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import ProjectInvolvementType from 'server/graphql/types/ProjectInvolvementType';
import RelayProject from 'server/graphql/types/RelayProject';
import TeamMember from 'server/graphql/types/TeamMember';

const NotifyProjectInvolves = new GraphQLObjectType({
  name: 'NotifyProjectInvolves',
  description: 'A notification sent to someone who was just added to a team',
  interfaces: () => [Notification],
  fields: () => ({
    ...notificationInterfaceFields,
    involvement: {
      type: ProjectInvolvementType,
      description: 'How the user is affiliated with the project'
    },
    projectId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The projectId that now involves the userId'
    },
    project: {
      type: RelayProject,
      description: 'The project that now involves the userId',
      resolve: ({projectId}) => {
        // FIXME after merging in the dataloader PR
        const r = getRethink();
        return r.table('Project').get(projectId).run();
      }
    },
    changeAuthorId: {
      type: GraphQLID,
      description: 'The teamMemberId of the person that made the change'
    },
    changeAuthor: {
      type: TeamMember,
      description: 'The TeamMember of the person that made the change',
      resolve: ({changeAuthorId}) => {
        // FIXME after merging in the dataloader PR
        const r = getRethink();
        return r.table('TeamMember').get(changeAuthorId).run();
      }
    },
    // inviterName: {
    //  type: new GraphQLNonNull(GraphQLString),
    //  description: 'The name of the person that invited them onto the team'
    // },
    //teamName: {
    //  type: new GraphQLNonNull(GraphQLString),
    //  description: 'The name of the team the user is joining'
    //},
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId the user is joining'
    },
    team: {
      type: Team,
      description: 'The team the project is on',
      resolve: ({teamId}) => {
        // FIXME after merging in the dataloader PR
        const r = getRethink();
        return r.table('Team').get(teamId).run();
      }
    }
  })
});

export default NotifyProjectInvolves;
