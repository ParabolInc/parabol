import {GraphQLID, GraphQLNonNull} from 'graphql';
import {toGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import RemoveGitHubRepoPayload from 'server/graphql/types/RemoveGitHubRepoPayload';
import archiveProjectsByGitHubRepo from 'server/safeMutations/archiveProjectsByGitHubRepo';
import getPubSub from 'server/utils/getPubSub';
import {GITHUB} from 'universal/utils/constants';

export default {
  name: 'GitHubRemoveMember',
  description: 'Receive a webhook from github saying an org member was removed',
  type: new GraphQLNonNull(RemoveGitHubRepoPayload),
  args: {
    userName: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The github login'
    },
    orgName: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The github org login'
    }
  },
  resolve: async (source, {userName, orgName}) => {
    const r = getRethink();

    const userId = await r.table('Provider')
      .getAll(userName, {index: 'providerUserId'})
      .filter({service: GITHUB})
      .filter((doc) => doc('teamIds').count().ne(0))
      .nth(0)('userId')
      .default(null);

    const updatedIntegrations = await r.table(GITHUB)
      .getAll(userId, {index: 'userId'})
      .filter((doc) => doc('nameWithOwner').match(`^${orgName}`))
      .update((doc) => ({
        userIds: doc('userIds').difference([userId]),
        isActive: doc('userIds').eq([userId]).not()
      }), {returnChanges: true})('changes');


    const archivedProjectsByRepo = await Promise.all(updatedIntegrations.map(({new_val: isActive, teamId, nameWithOwner}) => {
      if (!isActive) {
        return archiveProjectsByGitHubRepo(teamId, nameWithOwner);
      }
      return [];
    }));

    // 2 teams could use the same org, so break it down by team
    const payloadsByTeam = updatedIntegrations.reduce((obj, {new_val: {id, isActive, teamId}}, idx) => {
      if (!obj[teamId]) {
        obj[teamId] = {
          // TODO notification here
          leaveIntegration: []
        };
      }

      obj[teamId].leaveIntegration.push({
        globalId: toGlobalId(GITHUB, id),
        userId: isActive ? userId : null,
        archivedProjectsIds: archivedProjectsByRepo[idx]
      });
      return obj;
    });

    Object.keys(payloadsByTeam).forEach((teamId) => {
      const payload = payloadsByTeam[teamId];
      getPubSub().publish(`githubMemberRemoved.${teamId}`, payload);
    })
  }
};
