import {GraphQLBoolean, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import UpdateDragLocationInput, {
  UpdateDragLocationInputType
} from '../types/UpdateDragLocationInput'

const updateDragLocation = {
  description:
    'all the info required to provide an accurate display-specific location of where an item is',
  type: GraphQLBoolean,
  args: {
    input: {
      type: new GraphQLNonNull(UpdateDragLocationInput)
    }
  },
  async resolve(
    _source: unknown,
    {input}: {input: UpdateDragLocationInputType},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const {teamId, meetingId, ...inputData} = input
    const viewerId = getUserId(authToken)
    if (viewerId && authToken.tms.includes(teamId)) {
      const data = {remoteDrag: inputData, userId: viewerId}
      publish(SubscriptionChannel.MEETING, meetingId, 'UpdateDragLocationPayload', data, subOptions)
    }
  }
}

export default updateDragLocation
