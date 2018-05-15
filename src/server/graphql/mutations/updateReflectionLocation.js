import {GraphQLFloat, GraphQLID, GraphQLNonNull} from 'graphql'
import UpdateReflectionLocationPayload from 'server/graphql/types/UpdateReflectionLocationPayload'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import handleUpdatedLocation from 'server/graphql/mutations/helpers/updateReflectionLocation/handleUpdateLocation'

export default {
  type: UpdateReflectionLocationPayload,
  description: 'Update the sortOrder or phaseItemId of a reflection (usually by dragging it)',
  args: {
    reflectionId: {
      type: GraphQLID,
      description: 'null if the group is being moved'
    },
    retroPhaseItemId: {
      type: GraphQLID,
      description: 'The phase item the reflection group should move to'
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description:
        'the new in-group sort order if reflectionGroupId is provided, else the phase item sort order'
    },
    reflectionGroupId: {
      type: GraphQLID,
      description: 'The new group the reflection is a part of (or leaving, if null)'
    }
  },
  async resolve (source, {reflectionId, reflectionGroupId, retroPhaseItemId, sortOrder}, context) {
    const {dataLoader, socketId: mutatorId} = context
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const data = await handleUpdatedLocation(
      reflectionId,
      reflectionGroupId,
      retroPhaseItemId,
      sortOrder,
      context
    )
    if (!data.error) {
      publish(TEAM, data.teamId, UpdateReflectionLocationPayload, data, subOptions)
    }
    return data
  }
}
