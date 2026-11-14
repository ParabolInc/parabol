import type {DataLoaderWorker} from '../../../graphql'
import getRotationOrder from './getRotationOrder'

/**
 * Who should facilitate a meeting that is starting right now?
 * - autoAssignFacilitator off (default): whoever pressed Start, i.e. today's behavior
 * - on: the head of the queue just facilitated, so they go to the back and everyone else moves up
 *   one place. Whoever lands at the front facilitates.
 *
 * Either way the facilitator ends up at the head of the returned queue. Clients read the head as
 * the facilitator and hand the role over by moving someone there, so the two must stay in step.
 * The caller persists `rotation` once the meeting exists so a failed create does not skip a turn.
 */
const getNextFacilitatorUserId = async (
  teamId: string,
  starterUserId: string,
  dataLoader: DataLoaderWorker
) => {
  const [team, teamMembers] = await Promise.all([
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('teamMembersByTeamId').load(teamId)
  ])
  const order = getRotationOrder(teamMembers)
  if (!order.includes(starterUserId)) return {facilitatorUserId: starterUserId, rotation: null}
  if (!team.autoAssignFacilitator) {
    const rotation = [starterUserId, ...order.filter((userId) => userId !== starterUserId)]
    return {facilitatorUserId: starterUserId, rotation}
  }
  const [lastFacilitatorUserId, ...rest] = order
  const rotation = [...rest, lastFacilitatorUserId!]
  return {facilitatorUserId: rotation[0]!, rotation}
}

export default getNextFacilitatorUserId
