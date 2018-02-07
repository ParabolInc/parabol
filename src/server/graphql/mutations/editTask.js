import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import EditTaskPayload from 'server/graphql/types/EditTaskPayload';
import {getUserId, requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {PROJECT} from 'universal/utils/constants';
import promiseAllObj from 'universal/utils/promiseAllObj';

export default {
  type: EditTaskPayload,
  description: 'Announce to everyone that you are editing a task',
  args: {
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The task id that is being edited'
    },
    isEditing: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the editing is starting, false if it is stopping'
    }
  },
  async resolve(source, {taskId, isEditing}, {authToken, dataLoader, socketId: mutatorId}) {
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};
    // AUTH
    const viewerId = getUserId(authToken);
    const [teamId] = taskId.split('::');
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    // grab the task to see if it's private, don't share with other if it is
    const {task, teamMembers} = await promiseAllObj({
      task: dataLoader.get('tasks').load(taskId),
      teamMembers: dataLoader.get('teamMembersByTeamId').load(teamId)
    });
    const {tags, userId: taskUserId} = task;
    const isPrivate = tags.includes('private');
    const data = {taskId, editorId: viewerId, isEditing};
    teamMembers.forEach((teamMember) => {
      const {userId} = teamMember;
      if (!isPrivate || taskUserId === userId) {
        publish(PROJECT, userId, EditTaskPayload, data, subOptions);
      }
    });
    return data;
  }
};
