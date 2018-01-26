import shortid from 'shortid';
import getRethink from 'server/database/rethinkDriver';

const makeNewSoftTeamMembers = async (emails, teamId) => {
  const now = new Date();
  const r = getRethink();
  const inviteesSoftTeamMembers = await r.table('SoftTeamMember')
    .getAll(r.args(emails), {index: 'email'})
    .filter({isActive: true});
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
  }
  return newSoftTeamMembers;
};

export default makeNewSoftTeamMembers;
