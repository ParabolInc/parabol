import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import Team from 'server/graphql/types/Team';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import Task from 'server/graphql/types/Task';
import TaskInvolvementType from 'server/graphql/types/TaskInvolvementType';
import TeamMember from 'server/graphql/types/TeamMember';

const NotifyTaskInvolves = new GraphQLObjectType({
  name: 'NotifyTaskInvolves',
  description: 'A notification sent to someone who was just added to a team',
  interfaces: () => [Notification],
  fields: () => ({
    ...notificationInterfaceFields,
    involvement: {
      type: TaskInvolvementType,
      description: 'How the user is affiliated with the task'
    },
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The taskId that now involves the userId'
    },
    task: {
      type: Task,
      description: 'The task that now involves the userId',
      resolve: ({taskId}, args, {dataLoader}) => {
        return dataLoader.get('tasks').load(taskId);
      }
    },
    changeAuthorId: {
      type: GraphQLID,
      description: 'The teamMemberId of the person that made the change'
    },
    changeAuthor: {
      type: TeamMember,
      description: 'The TeamMember of the person that made the change',
      resolve: ({changeAuthorId}, args, {dataLoader}) => {
        return dataLoader.get('teamMembers').load(changeAuthorId);
      }
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    team: {
      type: Team,
      description: 'The team the task is on',
      resolve: ({teamId}, args, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId);
      }
    }
  })
});

export default NotifyTaskInvolves;
