import {GraphQLBoolean, GraphQLID, GraphQLObjectType} from 'graphql'
import {makeResolve, resolveNewMeeting} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import NewMeeting from 'server/graphql/types/NewMeeting'
import RetroReflection from 'server/graphql/types/RetroReflection'
import User from 'server/graphql/types/User'
import DragReflectionDropTargetTypeEnum from 'server/graphql/mutations/DragReflectionDropTargetTypeEnum'
import DragContext from 'server/graphql/types/DragContext'

const DragReflectionPayload = new GraphQLObjectType({
  name: 'DragReflectionPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    dragContext: {
      type: DragContext,
      description:
        'The proposed start/end of a drag. Subject to race conditions, it is up to the client to decide to accept or ignore'
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
    isDragging: {
      type: GraphQLBoolean,
      description: 'true if the reflection is being dragged, else false'
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
    user: {
      type: User,
      description: 'The user that is triggering the drag'
    },
    userId: {
      type: GraphQLID,
      description: 'foreign key to get user'
    }
  })
})

export default DragReflectionPayload
