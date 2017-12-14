import {GraphQLNonNull} from 'graphql';
import ms from 'ms';
import getRethink from 'server/database/rethinkDriver';
import publishChangeNotifications from 'server/graphql/mutations/helpers/publishChangeNotifications';
import AreaEnum from 'server/graphql/types/AreaEnum';
import UpdateProjectInput from 'server/graphql/types/UpdateProjectInput';
import UpdateProjectPayload from 'server/graphql/types/UpdateProjectPayload';
import {getUserId, requireTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {MEETING, PROJECT_UPDATED} from 'universal/utils/constants';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import makeProjectSchema from 'universal/validation/makeProjectSchema';

const DEBOUNCE_TIME = ms('5m');

export default {
  type: UpdateProjectPayload,
  description: 'Update a project with a change in content, ownership, or status',
  args: {
    area: {
      type: AreaEnum,
      description: 'The part of the site where the creation occurred'
    },
    updatedProject: {
      type: new GraphQLNonNull(UpdateProjectInput),
      description: 'the updated project including the id, and at least one other field'
    }
  },
  async resolve(source, {area, updatedProject}, {authToken, dataLoader, socketId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();

    // AUTH
    const myUserId = getUserId(authToken);
    const {id: projectId} = updatedProject;
    const [teamId] = projectId.split('::');
    requireTeamMember(authToken, teamId);

    // VALIDATION
    const schema = makeProjectSchema();
    const {errors, data: validUpdatedProject} = schema(updatedProject);
    handleSchemaErrors(errors);

    // RESOLUTION
    const {agendaId, content, status, userId, sortOrder} = validUpdatedProject;

    const newProject = {
      agendaId,
      content,
      status,
      userId,
      tags: content ? getTagsFromEntityMap(JSON.parse(content).entityMap) : undefined,
      teamId,
      teamMemberId: userId ? `${userId}::${teamId}` : undefined,
      sortOrder
    };

    let projectHistory;
    if (Object.keys(updatedProject).length > 2 || newProject.sortOrder === undefined) {
      // if this is anything but a sort update, log it to history
      newProject.updatedAt = now;
      const mergeDoc = {
        content,
        projectId,
        status,
        teamMemberId: newProject.teamMemberId,
        updatedAt: now,
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
    const {projectChanges, usersToIgnore} = await r({
      projectChanges: r.table('Project').get(projectId).update(newProject, {returnChanges: true})('changes')(0).default(null),
      history: projectHistory,
      usersToIgnore: area === MEETING ? await r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          isCheckedIn: true
        })('userId')
        .coerceTo('array') : []
    });
    if (!projectChanges) {
      throw new Error('Project already updated or does not exist');
    }

    // send project updated messages
    const {new_val: project, old_val: oldProject} = projectChanges;
    const projectUpdated = {project};
    const affectedUsers = Array.from(new Set([projectChanges.new_val.userId, projectChanges.old_val.userId]));
    affectedUsers.forEach((affectedUserId) => {
      getPubSub().publish(`${PROJECT_UPDATED}.${affectedUserId}`, {projectUpdated, operationId, mutatorId: socketId});
    });
    getPubSub().publish(`${PROJECT_UPDATED}.${teamId}`, {projectUpdated, operationId, mutatorId: socketId});

    // send notifications to assignees and mentionees
    publishChangeNotifications(project, oldProject, myUserId, usersToIgnore);

    return projectUpdated;
  }
};
