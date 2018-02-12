import {GraphQLID} from 'graphql';
import {forwardConnectionArgs} from 'graphql-relay';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import {TaskConnection} from 'server/graphql/types/Task';
import {getUserId, requireTeamMember} from 'server/utils/authorization';
import connectionFromTasks from 'server/graphql/queries/helpers/connectionFromTasks';

export default {
  type: TaskConnection,
  args: {
    ...forwardConnectionArgs,
    after: {
      type: GraphQLISO8601Type,
      description: 'the datetime cursor'
    },
    teamId: {
      type: GraphQLID,
      description: 'The unique team ID'
    }
  },
  async resolve(source, {teamId}, {authToken, dataLoader}) {
    // AUTH
    const userId = getUserId(authToken);
    let tasks;
    if (teamId) {
      requireTeamMember(authToken, teamId);
      tasks = await dataLoader.get('tasksByTeamId').load(teamId);
    } else {
      tasks = await dataLoader.get('tasksByUserId').load(userId);
    }

    // RESOLUTION
    return connectionFromTasks(tasks);
  }
};
