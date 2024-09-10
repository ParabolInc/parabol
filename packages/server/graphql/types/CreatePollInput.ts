import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import PollOptionInput from './CreatePollOptionInput'

const CreatePollInput = new GraphQLInputObjectType({
  name: 'CreatePollInput',
  fields: () => ({
    discussionId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Foreign key for the discussion this was created in'
    },
    threadSortOrder: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The order of this threadable'
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Poll question'
    },
    options: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PollOptionInput))),
      description: 'All the poll voting options'
    }
  })
})

export default CreatePollInput
