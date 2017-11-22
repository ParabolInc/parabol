import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import CreateProjectPayload from 'server/graphql/types/CreateProjectPayload';
import ProjectInput from 'server/graphql/types/ProjectInput';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {ASSIGNEE, MEETING, MENTIONEE, NOTIFICATIONS_ADDED, PROJECT_INVOLVES} from 'universal/utils/constants';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import getTypeFromEntityMap from 'universal/utils/draftjs/getTypeFromEntityMap';
import makeProjectSchema from 'universal/validation/makeProjectSchema';
import getPubSub from 'server/utils/getPubSub';
import AreaEnum from 'server/graphql/types/AreaEnum';

export default {
  type: CreateProjectPayload,
  description: 'Create a new project, triggering a CreateCard for other viewers',
  args: {
    newProject: {
      type: new GraphQLNonNull(ProjectInput),
      description: 'The new project including an id, status, and type, and teamMemberId'
    },
    area: {
      type: AreaEnum,
      description: 'The part of the site where the creation occurred'
    }
  },
  async resolve(source, {newProject, area}, {authToken, socket}) {
    const r = getRethink();
    const now = new Date();
    // AUTH
    const myUserId = getUserId(authToken);
    // format of id is teamId::taskIdPart
    requireWebsocket(socket);
    const [teamId] = newProject.id.split('::');
    requireSUOrTeamMember(authToken, teamId);

    // VALIDATION
    // TODO make id, status, teamMemberId required
    const schema = makeProjectSchema();
    // ensure that content is not empty
    const {errors, data: validNewProject} = schema({content: 1, ...newProject});
    handleSchemaErrors(errors);

    // RESOLUTION
    const [userId] = validNewProject.teamMemberId.split('::');
    const {content} = validNewProject;
    const {entityMap} = JSON.parse(content);
    const project = {
      ...validNewProject,
      userId,
      createdAt: now,
      createdBy: authToken.sub,
      tags: getTagsFromEntityMap(entityMap),
      teamId,
      updatedAt: now
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
      usersToIgnore: area === MEETING ? r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .filter({
          isCheckedIn: true
        })('userId')
        .coerceTo('array') : []
    });

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
    return {project};
  }
};

