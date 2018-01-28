import getRethink from 'server/database/rethinkDriver';
import {primeStandardLoader} from 'server/utils/RethinkDataLoader';
import ensureArray from 'universal/utils/ensureArray';

const getActiveSoftTeamMembersByEmail = async (maybeEmails, maybeTeamIds, dataLoader) => {
  const teamIds = ensureArray(maybeTeamIds);
  const emails = ensureArray(maybeEmails);
  const r = getRethink();
  const softTeamMembers = await r.table('SoftTeamMember')
    .getAll(r.args(emails), {index: 'email'})
    .filter({isActive: true})
    .filter((row) => r(teamIds).contains(row('teamId')))
    .default([]);
  primeStandardLoader(dataLoader.get('softTeamMembers'), softTeamMembers);
  return softTeamMembers;
};

export default getActiveSoftTeamMembersByEmail;
