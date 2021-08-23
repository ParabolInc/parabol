import {
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
    discussionId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Foreign key for the discussion this was created in'
    },
    title: {
      type: new GraphQLNonNull(GraphQLString)
    },
    options: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PollOptionInput)))
    }
  })
})

export default CreatePollInput
