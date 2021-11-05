import {GraphQLFloat, GraphQLID, GraphQLInputObjectType, GraphQLNonNull} from 'graphql'

const UpdateDragLocationInput = new GraphQLInputObjectType({
  name: 'UpdateDragLocationInput',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    clientHeight: {
      type: new GraphQLNonNull(GraphQLFloat)
    },
    clientWidth: {
      type: new GraphQLNonNull(GraphQLFloat)
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    sourceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The primary key of the item being drug'
    },
    targetId: {
      type: GraphQLID,
      description: 'The estimated destination of the item being drug'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId to broadcast the message to'
    },
    targetOffsetX: {
      type: GraphQLFloat,
      description: 'horizontal distance from the top left of the target'
    },
    targetOffsetY: {
      type: GraphQLFloat,
      description: 'vertical distance from the top left of the target'
    },
    clientX: {
      type: GraphQLFloat,
      description: 'the left of the source, relative to the client window'
    },
    clientY: {
      type: GraphQLFloat,
      description: 'the top of the source, relative to the client window'
    }
  })
})

export type UpdateDragLocationInputType = {
  id: string
  clientHeight: number
  clientWidth: number
  meetingId: string
  sourceId: string
  targetId?: string | null
  teamId: string
  targetOffsetX?: number | null
  targetOffsetY?: number | null
  clientX?: number | null
  clientY?: number | null
}

export default UpdateDragLocationInput
