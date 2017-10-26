import getRethink from 'server/database/rethinkDriver';

const addUserToTMSUserOrg = (userId, teamId, orgId, options = {}) => {
  const {returnChanges, role = null} = options;
  const r = getRethink();
  const now = new Date();

  return r.table('User')
    .get(userId)
    .update((user) => ({
      userOrgs: r.branch(
        user('userOrgs').contains((userOrg) => userOrg('id').eq(orgId)).default(false),
        user('userOrgs'),
        user('userOrgs').append({
          id: orgId,
          role
        })
      ),
      tms: r.branch(
        user('tms').contains(teamId).default(false),
        user('tms'),
        user('tms').default([]).append(teamId)
      ),
      updatedAt: now
    }), {returnChanges});
};

export default addUserToTMSUserOrg;
