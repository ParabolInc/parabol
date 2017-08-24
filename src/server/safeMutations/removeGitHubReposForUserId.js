import getRethink from 'server/database/rethinkDriver';
import {GITHUB} from 'universal/utils/constants';

const removeGitHubReposForUserId = (userId, teamIds) => {
  const r = getRethink();
  return r.table(GITHUB)
    .getAll(r.args(teamIds), {index: 'teamId'})
    .filter({isActive: true})
    .filter((doc) => doc('userIds').contains(userId))
    .update((doc) => ({
      userIds: doc('userIds').difference([userId]),
      isActive: doc('adminUserId').ne(userId)
    }), {returnChanges: true})('changes')
    .default([])
    .run();
};

export default removeGitHubReposForUserId;
