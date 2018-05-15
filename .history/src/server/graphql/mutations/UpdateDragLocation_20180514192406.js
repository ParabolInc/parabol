import type {Context} from 'server/flowtypes/graphql'
import {GraphQLNonNull} from 'graphql'
import DragReflectionPayload from 'server/graphql/types/DragReflectionPayload'
import UpdateDragLocationPayload from 'server/graphql/types/UpdateDragLocationPayload'
import UpdateLocationDragInput from 'server/graphql/types/UpdateLocationDragInput'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'

export default {
  description:
    'all the info required to provide an accurate display-specific location of where an item is',
  type: UpdateDragLocationPayload,
  args: {
    input: {
      type: new GraphQLNonNull(UpdateLocationDragInput)
    }
  },
  async resolve (source, input, {authToken, dataLoader, socketId: mutatorId}) {
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const {teamId, ...data} = input
    if (!authToken || !authTOken.tms.includes(teamId)) return

    publish(TEAM, teamId, DragReflectionPayload, data, subOptions)
    return data
  }
}
