import {MutationResolvers} from '../resolverTypes'
import {getUserId} from '../../../utils/authorization'
import getRethink from '../../../database/rethinkDriver'

const setTeamHealthScore: MutationResolvers['setTeamHealthScore'] = async (
  _source,
  {meetingId, phaseId, stageId, label},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  const r = await getRethink()

  await r.table('Organization').get(orgId).update({stripeId: customer.id}).run()

  return {
    meetingId,
    phaseId,
    stageId
  }
}

export default setTeamHealthScore
