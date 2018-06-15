import {GraphQLID, GraphQLObjectType} from 'graphql'
import {makeResolve, resolveNewMeeting} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import NewMeeting from 'server/graphql/types/NewMeeting'
import RetroReflection from 'server/graphql/types/RetroReflection'
import DragReflectionDropTargetTypeEnum from 'server/graphql/mutations/DragReflectionDropTargetTypeEnum'

const EndDraggingReflectionPayload = new GraphQLObjectType({
  name: 'EndDraggingReflectionPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    dropTargetType: {
      type: DragReflectionDropTargetTypeEnum,
      description: 'the type of item the reflection was dropped on'
    },
    dropTargetId: {
      type: GraphQLID,
      description:
        'The ID that the dragged item was dropped on, if dropTargetType is not specific enough'
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    meetingId: {
      type: GraphQLID
    },
    reflection: {
      type: RetroReflection,
      resolve: makeResolve('reflectionId', 'reflection', 'retroReflections')
    },
    reflectionGroupId: {
      type: GraphQLID
    },
    reflectionId: {
      type: GraphQLID
    },
    userId: {
      type: GraphQLID,
      description: 'foreign key to get user'
    }
  })
})

export default EndDraggingReflectionPayload
