import {GraphQLInputObjectType, GraphQLNonNull, GraphQLString} from 'graphql'

const PollOptionInput = new GraphQLInputObjectType({
  name: 'PollOptionInput',
  fields: () => ({
    title: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Poll option title'
    }
  })
})

export default PollOptionInput
