import {GraphQLBoolean, GraphQLNonNull} from 'graphql';
import ms from 'ms';
import getRethink from 'server/database/rethinkDriver';
import ProjectInput from 'server/graphql/types/ProjectInput';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {MEETING, PROJECT_UPDATED} from 'universal/utils/constants';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import makeProjectSchema from 'universal/validation/makeProjectSchema';
import publishChangeNotifications from 'server/graphql/mutations/helpers/publishChangeNotifications';
import AreaEnum from 'server/graphql/types/AreaEnum';

const DEBOUNCE_TIME = ms('5m');

export default {
  type: GraphQLBoolean,
  description: 'Update a project with a change in content, ownership, or status',
  args: {
    area: {
      type: AreaEnum,
      description: 'The part of the site where the creation occurred'
    },
    updatedProject: {
      type: new GraphQLNonNull(ProjectInput),
      description: 'the updated project including the id, and at least one other field'
    }
  },
  async resolve(source, {area, updatedProject}, {authToken}) {
    const r = getRethink();

    // AUTH
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
    const {projectChanges, usersToIgnore} = await r({
      projectChanges: r.table('Project').get(projectId).update(newProject, {returnChanges: true})('changes')(0).default(null),
      history: projectHistory,
      usersToIgnore: area === MEETING ? r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          isCheckedIn: true
        })('userId')
        .coerceTo('array') : []
    });
    if (!projectChanges) return true;
    const myUserId = getUserId(authToken);
    const {new_val: project, old_val: oldProject} = projectChanges;
    publishChangeNotifications(project, oldProject, myUserId, usersToIgnore);
    const projectUpdated = {project};
    // TODO when removing cashay, add in the mutatorId here
    getPubSub().publish(`${PROJECT_UPDATED}.${teamId}`, {projectUpdated});
    return true;
  }
};
