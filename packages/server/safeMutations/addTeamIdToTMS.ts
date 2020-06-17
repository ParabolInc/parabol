import getRethink from '../database/rethinkDriver'
import db from '../db'

const addTeamIdToTMS = async (userId, teamId) => {
  const r = await getRethink()
  return db.write('User', userId, (user) => ({
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
