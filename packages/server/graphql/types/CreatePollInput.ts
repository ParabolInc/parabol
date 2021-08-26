import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import PollOptionInput from './CreatePollOptionInput'

const CreatePollInput = new GraphQLInputObjectType({
  name: 'CreatePollInput',
  fields: () => ({
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'Foreign key for the team this poll belongs to'
    },
    discussionId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'Foreign key for the discussion this was created in'
    },
    threadSortOrder: {
      type: GraphQLNonNull(GraphQLFloat),
      description: 'The order of this threadable, relative to threadParentId'
    },
    title: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Poll question'
    },
    options: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(PollOptionInput))),
      description: 'All the poll voting options'
    }
  })
})

export default CreatePollInput
