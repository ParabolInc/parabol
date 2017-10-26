import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import {toGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import archiveProjectsForManyRepos from 'server/safeMutations/archiveProjectsForManyRepos';
import getPubSub from 'server/utils/getPubSub';
import {GITHUB} from 'universal/utils/constants';

export default {
  name: 'GitHubRemoveMember',
  description: 'Receive a webhook from github saying an org member was removed',
  type: GraphQLBoolean,
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
  resolve: async (source, {userName, orgName}, {serverSecret}) => {
    const r = getRethink();

    // AUTH
    if (serverSecret !== process.env.AUTH0_CLIENT_SECRET) {
      throw new Error('Don’t be rude.');
    }

    const userId = await r.table('Provider')
      .getAll(userName, {index: 'providerUserId'})
      .filter({service: GITHUB, isActive: true})
      .nth(0)('userId')
      .default(null);

    const updatedIntegrations = await r.table(GITHUB)
      .getAll(userId, {index: 'userIds'})
      .filter((doc) => doc('nameWithOwner').match(`^${orgName}`))
      .update((doc) => ({
        userIds: doc('userIds').difference([userId]),
        isActive: doc('userIds').eq([userId]).not()
      }), {returnChanges: true})('changes')
      .default([]);


    const archivedProjectsByRepo = await archiveProjectsForManyRepos(updatedIntegrations);

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
    }, {});
    Object.keys(payloadsByTeam).forEach((teamId) => {
      const githubMemberRemoved = payloadsByTeam[teamId];
      getPubSub().publish(`githubMemberRemoved.${teamId}`, {githubMemberRemoved});
    });
    return true;
  }
};
