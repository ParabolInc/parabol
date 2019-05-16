import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'

const UpdateAgendaItemInput = new GraphQLInputObjectType({
  name: 'UpdateAgendaItemInput',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique agenda item ID, composed of a teamId::shortid'
    },
    content: {
      type: GraphQLString,
      description: 'The content of the agenda item'
    },
    isActive: {
      type: GraphQLBoolean,
      description: 'true if not processed or deleted'
    },
    sortOrder: {
      type: GraphQLFloat,
      description: 'The sort order of the agenda item in the list'
    }
  })
})

export default UpdateAgendaItemInput
