import getRethink from 'server/database/rethinkDriver';
import {primeStandardLoader} from 'server/utils/RethinkDataLoader';

const getActiveTeamsByOrgId = async (orgId, dataLoader) => {
  const r = getRethink();
  const teams = await r.table('Team')
    .getAll(orgId, {index: 'orgId'})
    .filter({isArchived: false});
  primeStandardLoader(dataLoader.get('teams'), teams);
  return teams;
};

export default getActiveTeamsByOrgId;
