import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'

const AddCommentInput = new GraphQLInputObjectType({
  name: 'AddCommentInput',
  fields: () => ({
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A stringified draft-js document containing thoughts'
    },
    isAnonymous: {
      type: GraphQLBoolean,
      description: 'true if the comment should be anonymous'
    },
    discussionId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'foreign key for the discussion this was created in'
    },
    threadSortOrder: {
      type: new GraphQLNonNull(GraphQLFloat)
    },
    threadParentId: {
      type: GraphQLID
    }
  })
})

export default AddCommentInput
