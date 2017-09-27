import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import CreateProjectPayload from 'server/graphql/types/CreateProjectPayload';
import ProjectInput from 'server/graphql/types/ProjectInput';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {MAX_PERSONAL_PROJECTS} from 'server/utils/serverConstants';
import {errorObj, handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {BILLING_LEADER, MAX_PROJECTS_HIT, PERSONAL} from 'universal/utils/constants';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import makeProjectSchema from 'universal/validation/makeProjectSchema';

export default {
  type: CreateProjectPayload,
  description: 'Create a new project, triggering a CreateCard for other viewers',
  args: {
    newProject: {
      type: new GraphQLNonNull(ProjectInput),
      description: 'The new project including an id, status, and type, and teamMemberId'
    }
  },
  async resolve(source, {newProject}, {authToken, socket}) {
    const r = getRethink();

    // AUTH
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
    const now = new Date();
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
    const {orgProjectCount} = await r({
      project: r.table('Project').insert(project),
      history: r.table('ProjectHistory').insert(history),
      orgProjectCount: r.table('Team').get(teamId).pluck('tier', 'orgId')
        .do((team) => {
          return r.branch(
            team('tier').eq(PERSONAL),
            r.table('Team').getAll(team('orgId'), {index: 'orgId'})('id')
              .coerceTo('array')
              .do((teamIds) => r.table('Project').getAll(r.args(teamIds), {index: 'teamId'}).count()),
            1
          )
        })
    });
    if (orgProjectCount > MAX_PERSONAL_PROJECTS) {
      const {response: {billingLeaderUserIds, orgId}} = await r({
        removedProject: r.table('Project').get(project.id).delete(),
        removedHistory: r.table('ProjectHistory').get(history.id).delete(),
        response: r.table('Team').get(teamId)('orgId')
          .do((orgId) => r.table('Organization')
            .get(orgId)('orgUsers')
            .filter({
              role: BILLING_LEADER
            })('id')
            .coerceTo('array')
            .do((billingLeaderUserIds) => ({
              billingLeaderUserIds,
              orgId
            }))
          )
      });
      if (billingLeaderUserIds.includes(userId)) {
        throw errorObj({
          _error: MAX_PROJECTS_HIT,
          orgId
        })
      } else {
        const billingLeader = await r.table('User').get(billingLeaderUserIds[0])
          .pluck('email', 'preferredName');
        throw errorObj({
          _error: MAX_PROJECTS_HIT,
          billingLeader
        })
      }
    }

    return {project};
  }
};

