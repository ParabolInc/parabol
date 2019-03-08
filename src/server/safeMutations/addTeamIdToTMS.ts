import getRethink from 'server/database/rethinkDriver'

const addTeamIdToTMS = (userId, teamId) => {
  const r = getRethink()
  return r
    .table('User')
    .get(userId)
    .update((user) => ({
      tms: r.branch(
        user('tms')
          .contains(teamId)
          .default(false),
        user('tms'),
        user('tms')
          .default([])
          .append(teamId)
      )
    }))
}

export default addTeamIdToTMS
