import shortid from 'shortid';
import getRethink from 'server/database/rethinkDriver';
import {primeStandardLoader} from 'server/utils/RethinkDataLoader';
import getActiveSoftTeamMembersByEmail from 'server/safeQueries/getActiveSoftTeamMembersByEmail';

const makeNewSoftTeamMembers = async (emails, teamId, dataLoader) => {
  const now = new Date();
  const r = getRethink();
  const inviteesSoftTeamMembers = await getActiveSoftTeamMembersByEmail(emails, teamId, dataLoader);
  const newSoftTeamMembers = emails.reduce((arr, email) => {
    if (!inviteesSoftTeamMembers.find((softTeamMember) => softTeamMember.email === email)) {
      arr.push({
        id: shortid.generate(),
        createdAt: now,
        email,
        isActive: true,
        preferredName: email.split('@')[0],
        teamId
      });
    }
    return arr;
  }, []);

  if (newSoftTeamMembers.length > 0) {
    await r.table('SoftTeamMember').insert(newSoftTeamMembers);
    primeStandardLoader(dataLoader.get('softTeamMembers'), newSoftTeamMembers);
  }
  return newSoftTeamMembers;
};

export default makeNewSoftTeamMembers;
