import getRethink from 'server/database/rethinkDriver';

const insertNewTeamMember = (userId, teamId, checkInOrder) => {
  const r = getRethink();
  const teamMemberId = `${userId}::${teamId}`;
  return r.table('User').get(userId)
    .pluck('email', 'picture', 'preferredName')
    .do((user) => {
      return r.table('TeamMember').insert({
        id: teamMemberId,
        isCheckedIn: null,
        isNotRemoved: true,
        isLead: true,
        isFacilitator: true,
        checkInOrder: checkInOrder !== undefined ? checkInOrder : r.table('TeamMember')
          .getAll(teamId, {index: 'teamId'})
          .filter({isNotRemoved: true})
          .count()
          .add(1)
          .default(2),
        teamId,
        userId,
        email: user('email').default(''),
        picture: user('picture').default(''),
        preferredName: user('preferredName').default('')
        // conflict is possible if person was removed from the team + org & then rejoined (isNotRemoved would be false)
      }, {conflict: 'update'});
    });
};

export default insertNewTeamMember;