import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import AreaEnum from 'server/graphql/types/AreaEnum';
import CreateProjectPayload from 'server/graphql/types/CreateProjectPayload';
import CreateProjectInput from 'server/graphql/types/CreateProjectInput';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {
  ASSIGNEE,
  MEETING,
  MENTIONEE,
  NOTIFICATIONS_ADDED,
  PROJECT_CREATED,
  PROJECT_INVOLVES
} from 'universal/utils/constants';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap';
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
  async resolve(source, {newProject, area}, {authToken, getDataLoader}) {
    const r = getRethink();
    const dataLoader = getDataLoader();
    const operationId = dataLoader.share();
    const now = new Date();

    // AUTH
    const myUserId = getUserId(authToken);

    // VALIDATION
    const schema = makeProjectSchema();
    const {errors, data: validNewProject} = schema({content: 1, ...newProject});
    handleSchemaErrors(errors);
    const {teamId, userId, content} = validNewProject;
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const {entityMap} = JSON.parse(content);
    const project = {
      ...validNewProject,
      id: `${teamId}::${shortid.generate()}`,
      agendaId: validNewProject.agendaId,
      content: validNewProject.content,
      createdAt: now,
      createdBy: myUserId,
      sortOrder: validNewProject.sortOrder,
      status: validNewProject.status,
      tags: getTagsFromEntityMap(entityMap),
      teamId,
      teamMemberId: `${userId}::${teamId}`,
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

    getPubSub().publish(`${PROJECT_CREATED}.${teamId}`, {projectCreated, operationId});
    getPubSub().publish(`${PROJECT_CREATED}.${userId}`, {projectCreated, operationId});

    // Handle notifications
    // Almost always you start out with a blank card assigned to you (except for filtered team dash)
    const changeAuthorId = `${myUserId}::${teamId}`;
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
      .filter((mention) => mention !== myUserId && mention !== project.userId && !usersToIgnore.includes(mention))
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
        const notificationsAdded = {notifications: [notification]};
        const notificationUserId = notification.userIds[0];
        getPubSub().publish(`${NOTIFICATIONS_ADDED}.${notificationUserId}`, {notificationsAdded});
      });
    }
    return projectCreated;
  }
};
