import {GraphQLBoolean, GraphQLNonNull} from 'graphql'
import UpdateDragLocationInput from 'server/graphql/types/UpdateDragLocationInput'
import UpdateDragLocationPayload from 'server/graphql/types/UpdateDragLocationPayload'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import {getUserId} from 'server/utils/authorization'

const updateDragLocation = {
  description:
    'all the info required to provide an accurate display-specific location of where an item is',
  type: GraphQLBoolean,
  args: {
    input: {
      type: new GraphQLNonNull(UpdateDragLocationInput)
    }
  },
  async resolve (source, {input}, {authToken, dataLoader, socketId: mutatorId}) {
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const {teamId, ...inputData} = input
    const viewerId = getUserId(authToken)
    if (viewerId && authToken.tms.includes(teamId)) {
      const data = {...inputData, userId: viewerId}
      publish(TEAM, teamId, UpdateDragLocationPayload, data, subOptions)
    }
  }
}

export default updateDragLocation
