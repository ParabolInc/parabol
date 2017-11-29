import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {Team} from 'server/graphql/models/Team/teamSchema';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import TaskInvolvementType from 'server/graphql/types/TaskInvolvementType';
import RelayTask from 'server/graphql/types/RelayTask';
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
      type: RelayTask,
      description: 'The task that now involves the userId',
      resolve: ({taskId}) => {
        // FIXME after merging in the dataloader PR
        const r = getRethink();
        return r.table('Task').get(taskId).run();
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
    // teamName: {
    //  type: new GraphQLNonNull(GraphQLString),
    //  description: 'The name of the team the user is joining'
    // },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId the user is joining'
    },
    team: {
      type: Team,
      description: 'The team the task is on',
      resolve: ({teamId}) => {
        // FIXME after merging in the dataloader PR
        const r = getRethink();
        return r.table('Team').get(teamId).run();
      }
    }
  })
});

export default NotifyTaskInvolves;
