import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {GQLContext} from '../graphql'

const RemoteReflectionDrag = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoteReflectionDrag',
  description: 'Info associated with a current drag',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    dragUserId: {
      description: 'The userId of the person currently dragging the reflection',
      type: GraphQLID
    },
    dragUserName: {
      description: 'The name of the dragUser',
      type: GraphQLString,
      resolve: async ({dragUserId}, _args: unknown, {dataLoader}: GQLContext) => {
        const user = await dataLoader.get('users').load(dragUserId)
        return user?.preferredName
      }
    },
    isSpotlight: {
      type: GraphQLBoolean
    },
    clientHeight: {
      type: GraphQLFloat
    },
    clientWidth: {
      type: GraphQLFloat
    },
    sourceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The primary key of the item being drug'
    },
    targetId: {
      type: GraphQLID,
      description: 'The estimated destination of the item being drug'
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

export default RemoteReflectionDrag
