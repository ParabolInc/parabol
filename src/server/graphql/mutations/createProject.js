import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import AreaEnum from 'server/graphql/types/AreaEnum';
import CreateProjectInput from 'server/graphql/types/CreateProjectInput';
import CreateProjectPayload from 'server/graphql/types/CreateProjectPayload';
import {getUserId, requireTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {
  ADDED, ASSIGNEE, MEETING, MENTIONEE, NOTIFICATION, PROJECT,
  PROJECT_INVOLVES
} from 'universal/utils/constants';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';
import makeProjectSchema from 'universal/validation/makeProjectSchema';

export default {
  type: CreateProjectPayload,
  description: 'Create a new project, triggering a CreateCard for other viewers',
  args: {
    newProject: {
      type: new GraphQLNonNull(CreateProjectInput),
      description: 'The new project including an id, status, and type, and teamMemberId'
    },
    area: {
      type: AreaEnum,
      description: 'The part of the site where the creation occurred'
    }
  },
  async resolve(source, {newProject, area}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const now = new Date();
    const subOptions = {operationId, mutatorId};
    // AUTH
    // VALIDATION
    const viewerId = getUserId(authToken);
    const schema = makeProjectSchema();
    const {errors, data: validNewProject} = schema({content: 1, ...newProject});
    handleSchemaErrors(errors);
    const {teamId, userId, content} = validNewProject;
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const teamMemberId = toTeamMemberId(teamId, userId);
    const projectId = `${teamId}::${shortid.generate()}`;
    const {entityMap} = JSON.parse(content);
    const tags = getTagsFromEntityMap(entityMap);
    const isPrivate = tags.includes('private');
    const project = {
      id: projectId,
      agendaId: validNewProject.agendaId,
      content: validNewProject.content,
      createdAt: now,
      createdBy: viewerId,
      sortOrder: validNewProject.sortOrder,
      status: validNewProject.status,
      tags,
      teamId,
      teamMemberId,
      updatedAt: now,
      userId
    };
    const history = {
      id: shortid.generate(),
      content: project.content,
      projectId: project.id,
      status: project.status,
      teamMemberId: project.teamMemberId,
      updatedAt: project.updatedAt
    };
    const {usersToIgnore} = await r({
      project: r.table('Project').insert(project),
      history: r.table('ProjectHistory').insert(history),
      usersToIgnore: area === MEETING ? await r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          isCheckedIn: true
        })('userId')
        .coerceTo('array') : []
    });
    const projectCreated = {project};
    const data = {type: ADDED, projectId, isPrivate, wasPrivate: false, userId};
    getPubSub().publish(`${PROJECT}.${teamId}`, {data, ...subOptions});

    // Handle notifications
    // Almost always you start out with a blank card assigned to you (except for filtered team dash)
    const changeAuthorId = toTeamMemberId(teamId, viewerId);
    const notificationsToAdd = [];
    if (changeAuthorId !== project.teamMemberId && !usersToIgnore.includes(project.userId)) {
      notificationsToAdd.push({
        id: shortid.generate(),
        startAt: now,
        type: PROJECT_INVOLVES,
        userIds: [userId],
        involvement: ASSIGNEE,
        projectId: project.id,
        changeAuthorId,
        teamId
      });
    }

    getTypeFromEntityMap('MENTION', entityMap)
      .filter((mention) => mention !== viewerId && mention !== project.userId && !usersToIgnore.includes(mention))
      .forEach((mentioneeUserId) => {
        notificationsToAdd.push({
          id: shortid.generate(),
          startAt: now,
          type: PROJECT_INVOLVES,
          userIds: [mentioneeUserId],
          involvement: MENTIONEE,
          projectId: project.id,
          changeAuthorId,
          teamId
        });
      });
    if (notificationsToAdd.length) {
      await r.table('Notification').insert(notificationsToAdd);
      notificationsToAdd.forEach((notification) => {
        const {id: notificationId, userIds} = notification;
        const notificationUserId = userIds[0];
        getPubSub().publish(`${NOTIFICATION}.${notificationUserId}`, {data: {type: ADDED, notificationId}, ...subOptions});
      });
    }
    return projectCreated;
  }
};
