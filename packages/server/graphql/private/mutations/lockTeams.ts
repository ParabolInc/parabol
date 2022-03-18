import getRethink from '../../../database/rethinkDriver'
import updateTeamByTeamId from '../../../postgres/queries/updateTeamByTeamId'
import {requireSU} from '../../../utils/authorization'
import {QueryResolvers} from '../resolverTypes'

const lockTeams: QueryResolvers['lockTeams'] = async (
  _source,
  {message, teamIds, isPaid},
  {authToken}
) => {
  const r = await getRethink()

  // AUTH
  requireSU(authToken)
  const lockMessageHTML = isPaid ? null : message ?? null

  // RESOLUTION
  const updates = {
    isPaid,
    lockMessageHTML,
    updatedAt: new Date()
  }
  await Promise.all([
    r.table('Team').getAll(r.args(teamIds)).update(updates).run(),
    updateTeamByTeamId(updates, teamIds)
  ])
  return true
}

export default lockTeams
