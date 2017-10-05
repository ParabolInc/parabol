import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean
} from 'graphql';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import shortid from 'shortid';
import ms from 'ms';
import makeProjectSchema from 'universal/validation/makeProjectSchema';
import {handleSchemaErrors} from 'server/utils/utils';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import ProjectInput from 'server/graphql/types/ProjectInput';

const DEBOUNCE_TIME = ms('5m');

export default {
  type: GraphQLBoolean,
  description: 'Update a project with a change in content, ownership, or status',
  args: {
    updatedProject: {
      type: new GraphQLNonNull(ProjectInput),
      description: 'the updated project including the id, and at least one other field'
    }
  },
  async resolve(source, {updatedProject}, {authToken, socket}) {
    const r = getRethink();

    // AUTH
    requireWebsocket(socket);
    // projectId is of format 'teamId::taskId'
    const [teamId] = updatedProject.id.split('::');
    requireSUOrTeamMember(authToken, teamId);

    // VALIDATION
    const schema = makeProjectSchema();
    const {errors, data: validUpdatedProject} = schema(updatedProject);
    handleSchemaErrors(errors);

    // RESOLUTION
    const {id: projectId, sortOrder, agendaId, content, ...historicalProject} = validUpdatedProject;

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
    const dbWork = [];

    if (Object.keys(updatedProject).length > 2 || sortOrder === undefined) {
      // if this is anything but a sort update, log it to history
      const mergeDoc = {
        ...historicalProject,
        content,
        updatedAt: now,
        projectId,
        tags: newProject.tags
      };
      const projectHistoryPromise = r.table('ProjectHistory')
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
      dbWork.push(projectHistoryPromise);
      newProject.updatedAt = now;
    }
    dbWork.push(r.table('Project').get(projectId).update(newProject));
    await Promise.all(dbWork);
    return true;
  }
};
