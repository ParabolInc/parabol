import {GraphQLID, GraphQLNonNull} from 'graphql';
import {fromGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import LeaveIntegrationPayload from 'server/graphql/types/LeaveIntegrationPayload';
import archiveTasksByGitHubRepo from 'server/safeMutations/archiveTasksByGitHubRepo';
import {getUserId, isTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {GITHUB} from 'universal/utils/constants';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';
import {sendIntegrationNotFoundError} from 'server/utils/docNotFoundErrors';
import {sendAlreadyUpdatedIntegrationError} from 'server/utils/alreadyMutatedErrors';
import sendAuthRaven from 'server/utils/sendAuthRaven';

export default {
  type: new GraphQLNonNull(LeaveIntegrationPayload),
  description: 'Remove yourself from an integration',
  args: {
    globalId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the id of the integration to remove'
    }
  },
  async resolve (source, {globalId}, {authToken, socketId: mutatorId, dataLoader}) {
    const r = getRethink();
    const {id: localId, type: service} = fromGlobalId(globalId);

    // AUTH
    const userId = getUserId(authToken);
    const integration = await r.table(service).get(localId);
    if (!integration) {
      return sendIntegrationNotFoundError(globalId);
    }
    const {adminUserId, teamId, userIds} = integration;
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId);
    }

    // VALIDATION
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId);
    }

    if (!userIds.includes(userId)) {
      const breadcrumb = {
        message: 'You are not a part of this integration',
        category: 'Already mutated',
        data: {globalId}
      };
      return sendAuthRaven(authToken, 'Easy there', breadcrumb);
    }

    if (userId === adminUserId) {
      const breadcrumb = {
        message: 'The repo admin cannot leave the repo',
        category: 'Leave integration',
        data: {globalId}
      };
      return sendAuthRaven(authToken, 'Hold up', breadcrumb);
    }

    // RESOLUTION
    const updatedIntegration = await r
      .table(service)
      .get(localId)
      .update(
        (doc) => ({
          userIds: doc('userIds').difference([userId]),
          isActive: doc('adminUserId')
            .eq(userId)
            .not()
        }),
        {returnChanges: true}
      )('changes')(0)('new_val')
      .default(null);

    if (!updatedIntegration) {
      return sendAlreadyUpdatedIntegrationError(authToken, globalId);
    }

    const {isActive, nameWithOwner} = updatedIntegration;
    let archivedTaskIds = [];
    if (isActive === false) {
      if (service === GITHUB) {
        archivedTaskIds = await archiveTasksByGitHubRepo(teamId, nameWithOwner, dataLoader);
      }
    }

    const integrationLeft = {
      globalId,
      userId: isActive ? userId : null,
      archivedTaskIds
    };
    getPubSub().publish(`integrationLeft.${teamId}.${service}`, {
      integrationLeft,
      mutatorId
    });
    return integrationLeft;
  }
};
