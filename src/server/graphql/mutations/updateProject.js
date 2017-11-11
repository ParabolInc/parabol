import {GraphQLNonNull} from 'graphql';
import ms from 'ms';
import getRethink from 'server/database/rethinkDriver';
import ProjectInput from 'server/graphql/types/ProjectInput';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {PROJECT_UPDATED} from 'universal/utils/constants';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import makeProjectSchema from 'universal/validation/makeProjectSchema';
import UpdateProjectPayload from 'server/graphql/types/UpdateProjectPayload';
import {fromGlobalId} from 'graphql-relay';

const DEBOUNCE_TIME = ms('5m');

export default {
  type: UpdateProjectPayload,
  description: 'Update a project with a change in content, ownership, or status',
  args: {
    updatedProject: {
      type: new GraphQLNonNull(ProjectInput),
      description: 'the updated project including the id, and at least one other field'
    }
  },
  async resolve(source, {updatedProject}, {authToken, operationId, sharedDataloader, socketId}) {
    const r = getRethink();

    // AUTH
    // projectId is of format 'teamId::taskId'
    const {id: projectId, type} = fromGlobalId(updatedProject.id);
    if (type !== 'Project') {
      throw new Error('Invalid Project ID');
    }

    const [teamId] = projectId.split('::');
    requireSUOrTeamMember(authToken, teamId);

    // VALIDATION
    const schema = makeProjectSchema();
    const {errors, data: validUpdatedProject} = schema(updatedProject);
    handleSchemaErrors(errors);

    // RESOLUTION
    const {id, sortOrder, agendaId, content, ...historicalProject} = validUpdatedProject;

    const now = new Date();

    const newProject = {
      ...historicalProject,
      agendaId,
      content,
      sortOrder
    };
    const {teamMemberId} = historicalProject;
    if (teamMemberId) {
      const [userId] = teamMemberId.split('::');
      newProject.userId = userId;
    }

    if (content) {
      const {entityMap} = JSON.parse(content);
      newProject.tags = getTagsFromEntityMap(entityMap);
    }
    let projectHistory;
    if (Object.keys(updatedProject).length > 2 || sortOrder === undefined) {
      // if this is anything but a sort update, log it to history
      newProject.updatedAt = now;
      const mergeDoc = {
        ...historicalProject,
        content,
        updatedAt: now,
        projectId,
        tags: newProject.tags
      };
      projectHistory = r.table('ProjectHistory')
        .between([projectId, r.minval], [projectId, r.maxval], {index: 'projectIdUpdatedAt'})
        .orderBy({index: 'projectIdUpdatedAt'})
        .nth(-1)
        .default({updatedAt: r.epochTime(0)})
        .do((lastDoc) => {
          return r.branch(
            lastDoc('updatedAt').gt(r.epochTime((now - DEBOUNCE_TIME) / 1000)),
            r.table('ProjectHistory').get(lastDoc('id')).update(mergeDoc),
            r.table('ProjectHistory').insert(lastDoc.merge(mergeDoc, {id: shortid.generate()}))
          );
        });
    }
    const {projectChanges} = await r({
      projectChanges: r.table('Project').get(projectId).update(newProject, {returnChanges: true})('changes')(0).default(null),
      history: projectHistory
    });
    if (!projectChanges) {
      throw new Error('Project does not exist');
    }
    const project = projectChanges.new_val;
    const projectUpdated = {project};
    const affectedUsers = Array.from(new Set([projectChanges.new_val.userId, projectChanges.old_val.userId]));
    sharedDataloader.share(operationId);
    affectedUsers.forEach((userId) => {
      getPubSub().publish(`${PROJECT_UPDATED}.${userId}`, {projectUpdated, operationId, mutatorId: socketId});
    });
    getPubSub().publish(`${PROJECT_UPDATED}.${teamId}`, {projectUpdated, operationId, mutatorId: socketId});
    return projectUpdated;
  }
};
