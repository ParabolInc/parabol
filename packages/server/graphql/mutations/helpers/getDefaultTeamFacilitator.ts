import type {DataLoaderWorker} from '../../graphql'

/**
 * The user who runs a team's recurring meetings when the obvious candidate cannot: the person
 * scheduling is not on the team, or the series facilitator has since left it.
 *
 * Prefers the lead, as the team's standing owner, and otherwise takes the longest-standing member,
 * so one person's departure never ends a series the rest of the team still wants. Ordering by
 * createdAt keeps the choice stable across runs rather than whatever the loader happened to return.
 *
 * Null only when the team has nobody left, which is the one case with no successor to hand it to.
 */
const getDefaultTeamFacilitator = async (teamId: string, dataLoader: DataLoaderWorker) => {
  // the loader already filters out removed members
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const candidates = [...teamMembers].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  const facilitator = candidates.find(({isLead}) => isLead) ?? candidates[0]
  return facilitator?.userId ?? null
}

export default getDefaultTeamFacilitator
