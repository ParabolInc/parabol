import getRethink from 'server/database/rethinkDriver';

const removeSoftTeamMember = (email, teamId) => {
  const r = getRethink();
  return r.table('SoftTeamMember')
    .getAll(email, {index: 'email'})
    .filter({teamId})
    .update({isActive: false}, {returnChanges: true})('changes')(0)('new_val')('id')
    .default(null)
    .do((softTeamMemberId) => {
      return r({
        softTeamMemberId,
        softProjectsToArchive: r.table('Project')
          .getAll(softTeamMemberId, {index: 'assigneeId'})
          .default([])
          .coerceTo('array')
      });
    })
};

export default removeSoftTeamMember;
