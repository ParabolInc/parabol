import {GraphQLID, GraphQLNonNull} from 'graphql';
import {fromGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import DeleteProjectPayload from 'server/graphql/types/DeleteProjectPayload';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {PROJECT_DELETED} from 'universal/utils/constants';

export default {
  type: DeleteProjectPayload,
  description: 'Delete (not archive!) a project',
  args: {
    projectId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The globalId to delete'
    }
  },
  async resolve(source, {projectId}, {authToken, operationId, sharedDataloader}) {
    const r = getRethink();

    // AUTH
    const userId = getUserId(authToken);
    const {id: dbId, type} = fromGlobalId(projectId);
    if (type !== 'Project') {
      throw new Error('Invalid Project ID');
    }
    // format of id is teamId::shortId
    const [teamId] = dbId.split('::');
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const {project} = await r({
      project: r.table('Project').get(dbId).delete({returnChanges: true})('changes')(0)('old_val').default(null),
      projectHistory: r.table('ProjectHistory')
        .between([dbId, r.minval], [dbId, r.maxval], {index: 'projectIdUpdatedAt'})
        .delete()
    });
    if (!project) {
      throw new Error('Project does not exist');
    }
    const projectDeleted = {project};
    sharedDataloader.share(operationId);
    getPubSub().publish(`${PROJECT_DELETED}.${teamId}`, {projectDeleted});
    getPubSub().publish(`${PROJECT_DELETED}.${userId}`, {projectDeleted});
    return projectDeleted;
  }
};
