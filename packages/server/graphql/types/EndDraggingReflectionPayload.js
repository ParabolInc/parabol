import {GraphQLID, GraphQLObjectType} from 'graphql'
import {makeResolve, resolveNewMeeting} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import RetroReflection from 'server/graphql/types/RetroReflection'
import DragReflectionDropTargetTypeEnum from 'server/graphql/mutations/DragReflectionDropTargetTypeEnum'
import RetroReflectionGroup from 'server/graphql/types/RetroReflectionGroup'
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting'

const EndDraggingReflectionPayload = new GraphQLObjectType({
  name: 'EndDraggingReflectionPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    dragId: {
      type: GraphQLID
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
      type: RetrospectiveMeeting,
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
    },
    reflectionGroup: {
      type: RetroReflectionGroup,
      description:
        'The group encapsulating the new reflection. A new one was created if one was not provided.',
      resolve: makeResolve('reflectionGroupId', 'reflectionGroup', 'retroReflectionGroups')
    },
    oldReflectionGroup: {
      type: RetroReflectionGroup,
      description: 'The old group the reflection was in',
      resolve: makeResolve('oldReflectionGroupId', 'oldReflectionGroup', 'retroReflectionGroups')
    }
  })
})

export default EndDraggingReflectionPayload
