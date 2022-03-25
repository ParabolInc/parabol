import getRethink from '../../../database/rethinkDriver'
import updateTeamByTeamId from '../../../postgres/queries/updateTeamByTeamId'
import {requireSU} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

const lockTeams: MutationResolvers['lockTeams'] = async (
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
  await updateTeamByTeamId(updates, teamIds)
  return true
}

export default lockTeams
