import ensureArray from 'universal/utils/ensureArray';
import getRethink from 'server/database/rethinkDriver';
import {primeStandardLoader} from 'server/utils/RethinkDataLoader';

const getActiveTeamMembersByTeamIds = async (maybeTeamIds, dataLoader) => {
  const teamIds = ensureArray(maybeTeamIds);
  const r = getRethink();
  const teamMembers = await r.table('TeamMember')
    .getAll(r.args(teamIds), {index: 'teamId'})
    .filter({isNotRemoved: true});
  primeStandardLoader(dataLoader.get('teamMembers'), teamMembers);
  return teamMembers;
};

export default getActiveTeamMembersByTeamIds;
