import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateDragLocation: MutationResolvers['updateDragLocation'] = async (
  _source,
  {input},
  {authToken, socketId: mutatorId}
) => {
  const {teamId: _teamId, meetingId, ...inputData} = input
  const viewerId = getUserId(authToken)
  const data = {remoteDrag: inputData, userId: viewerId}
  // A broadcast with no Postgres reads and no dataloader. Without an operationId, publish stores
  // nothing in Redis and receivers fetch nothing: they get only coordinates and need no data.
  publish(SubscriptionChannel.MEETING, meetingId, 'UpdateDragLocationPayload', data, {mutatorId})
  return true
}

export default updateDragLocation
