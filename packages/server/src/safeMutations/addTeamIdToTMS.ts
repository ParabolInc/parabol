import getRethink from '../database/rethinkDriver'

const addTeamIdToTMS = async (userId, teamId) => {
  const r = await getRethink()
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
    .run()
}

export default addTeamIdToTMS
