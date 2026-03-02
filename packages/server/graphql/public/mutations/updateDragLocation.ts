import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateDragLocation: MutationResolvers['updateDragLocation'] = async (
  _source,
  {input},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const {teamId, meetingId, ...inputData} = input
  const viewerId = getUserId(authToken)
  if (viewerId && authToken.tms.includes(teamId)) {
    const data = {remoteDrag: inputData, userId: viewerId}
    publish(SubscriptionChannel.MEETING, meetingId, 'UpdateDragLocationPayload', data, subOptions)
  }
  return true
}

export default updateDragLocation
