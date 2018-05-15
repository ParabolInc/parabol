import {GraphQLBoolean, GraphQLID, GraphQLObjectType, GraphQLNonNull} from 'graphql'
import {makeResolve, resolveNewMeeting} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import NewMeeting from 'server/graphql/types/NewMeeting'
import RetroReflection from 'server/graphql/types/RetroReflection'
import User from 'server/graphql/types/User'
import DraggableTypeEnum from 'server/graphql/types/DraggableTypeEnum'
import DraggerCoords from 'server/graphql/types/DraggerCoords'

const UpdateDragLocationPayload = new GraphQLObjectType({
  name: 'UpdateDragLocationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    draggerCoords: {
      type: new GraphQLNonNull(DraggerCoords)
    },
    type: {
      type: new GraphQLNonNull(DraggableTypeEnum),
      description: 'The type of entity being drug'
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    reflection: {
      type: RetroReflection,
      resolve: makeResolve('reflectionId', 'reflection', 'retroReflections')
    },
    userId: {
      type: GraphQLID,
      description: 'foreign key to get user'
    },
    user: {
      type: User,
      description: 'The user that is triggering the drag'
    },
    isDragging: {
      type: GraphQLBoolean,
      description: 'true if the reflection is being dragged, else false'
    }
  })
})

export default UpdateDragLocationPayload
