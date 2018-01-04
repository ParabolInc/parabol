import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import DeleteProjectPayload from 'server/graphql/types/DeleteProjectPayload';
import {requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {NOTIFICATION, PROJECT, PROJECT_INVOLVES} from 'universal/utils/constants';
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap';

export default {
  type: DeleteProjectPayload,
  description: 'Delete (not archive!) a project',
  args: {
    projectId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The projectId to delete'
    }
  },
  async resolve(source, {projectId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    // format of id is teamId::shortId
    const [teamId] = projectId.split('::');
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const {project, subscribedUserIds} = await r({
      project: r.table('Project').get(projectId).delete({returnChanges: true})('changes')(0)('old_val').default(null),
      projectHistory: r.table('ProjectHistory')
        .between([projectId, r.minval], [projectId, r.maxval], {index: 'projectIdUpdatedAt'})
        .delete(),
      subscribedUserIds: r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({isNotRemoved: true})('userId')
        .coerceTo('array')
    });
    if (!project) {
      throw new Error('Project does not exist');
    }
    const {content, tags, userId: projectUserId} = project;

    // handle notifications
    const {entityMap} = JSON.parse(content);
    const userIdsWithNotifications = getTypeFromEntityMap('MENTION', entityMap).concat(projectUserId);
    const clearedNotifications = await r.table('Notification')
      .getAll(r.args(userIdsWithNotifications), {index: 'userIds'})
      .filter({
        projectId,
        type: PROJECT_INVOLVES
      })
      .delete({returnChanges: true})('changes')('old_val')
      .default([]);

    const data = {projectId, notifications: clearedNotifications};
    clearedNotifications.forEach((notification) => {
      const {userIds: [notificationUserId]} = notification;
      publish(NOTIFICATION, notificationUserId, DeleteProjectPayload, data, subOptions);
    });

    const isPrivate = tags.includes('private');
    subscribedUserIds.forEach(({userId}) => {
      if (!isPrivate || userId === projectUserId) {
        publish(PROJECT, userId, DeleteProjectPayload, data, subOptions);
      }
    });
    return data;
  }
};
