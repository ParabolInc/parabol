import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import {Team} from 'server/graphql/models/Team/teamSchema';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import Project from 'server/graphql/types/Project';
import ProjectInvolvementType from 'server/graphql/types/ProjectInvolvementType';
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
      description: '(DB) The projectId that now involves the userId'
    },
    project: {
      type: Project,
      description: 'The project that now involves the userId',
      resolve: ({projectId}, args, {getDataLoader}) => {
        return getDataLoader().projects.load(projectId);
      }
    },
    changeAuthorId: {
      type: GraphQLID,
      description: '(DB) The teamMemberId of the person that made the change'
    },
    changeAuthor: {
      type: TeamMember,
      description: 'The TeamMember of the person that made the change',
      resolve: ({changeAuthorId}, args, {getDataLoader}) => {
        return getDataLoader().teamMembers.load(changeAuthorId);
      }
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '(DB) The teamId the user is joining'
    },
    team: {
      type: Team,
      description: 'The team the project is on',
      resolve: ({teamId}, args, {getDataLoader}) => {
        return getDataLoader().teams.load(teamId);
      }
    }
  })
});

export default NotifyProjectInvolves;
