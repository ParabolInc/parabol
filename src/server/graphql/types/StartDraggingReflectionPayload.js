import {GraphQLID, GraphQLObjectType} from 'graphql'
import {makeResolve, resolveNewMeeting} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import RetroReflection from 'server/graphql/types/RetroReflection'
import DragContext from 'server/graphql/types/DragContext'
import NewMeeting from 'server/graphql/types/NewMeeting'

const StartDraggingReflectionPayload = new GraphQLObjectType({
  name: 'StartDraggingReflectionPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    dragContext: {
      type: DragContext,
      description:
        'The proposed start/end of a drag. Subject to race conditions, it is up to the client to decide to accept or ignore'
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
    reflectionId: {
      type: GraphQLID
    }
  })
})

export default StartDraggingReflectionPayload
