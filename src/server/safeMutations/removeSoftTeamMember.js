import getRethink from 'server/database/rethinkDriver';

const removeSoftTeamMember = async (email, teamId, dataLoader) => {
  const r = getRethink();
  const removedSoftTeamMember = await r.table('SoftTeamMember')
    .getAll(email, {index: 'email'})
    .filter({isActive: true, teamId})
    .update({isActive: false}, {returnChanges: true})('changes')(0)('new_val')
    .default(null);
  if (removedSoftTeamMember) {
    const {id} = removedSoftTeamMember;
    dataLoader.get('softTeamMembers').clear(id).prime(id, removedSoftTeamMember);
  }
  return removedSoftTeamMember;
};

export default removeSoftTeamMember;

// .do((softTeamMemberId) => {
//   return r({
//     softTeamMemberId,
//     softProjectsToArchive: r.table('Project')
//       .getAll(softTeamMemberId, {index: 'assigneeId'})
//       .default([])
//       .coerceTo('array')
//   });
// })
