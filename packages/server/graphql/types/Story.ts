import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'

export const storyFields = () => ({
  id: {
    type: GraphQLNonNull(GraphQLID),
    description: 'serviceTaskId'
  }
})

const Story = new GraphQLInterfaceType({
  name: 'Story',
  description: 'An entity that can be used in a poker meeting and receive estimates',
  fields: () => ({
    ...storyFields()
  })
})

export default Story
