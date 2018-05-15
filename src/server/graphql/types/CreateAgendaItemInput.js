import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'

const CreateAgendaItemInput = new GraphQLInputObjectType({
  name: 'CreateAgendaItemInput',
  fields: () => ({
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The content of the agenda item'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team member ID of the person creating the agenda item'
    },
    sortOrder: {
      type: GraphQLFloat,
      description: 'The sort order of the agenda item in the list'
    }
  })
})

export default CreateAgendaItemInput
