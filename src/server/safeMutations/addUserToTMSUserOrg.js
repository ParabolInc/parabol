import getRethink from 'server/database/rethinkDriver';

const addUserToTMSUserOrg = (userId, teamId, orgId, options = {}) => {
  const {returnChanges, role = null} = options;
  const r = getRethink();
  return r.table('User')
    .get(userId)
    .update((userDoc) => ({
      userOrgs: r.branch(
        userDoc('userOrgs').contains((userOrg) => userOrg('id').eq(orgId)).default(false),
        userDoc('userOrgs'),
        userDoc('userOrgs').append({
          id: orgId,
          role
        })
      ),
      tms: r.branch(
        userDoc('tms').contains(teamId).default(false),
        userDoc('tms'),
        userDoc('tms').default([]).append(teamId)
      )
    }), {returnChanges});
};

export default addUserToTMSUserOrg;
