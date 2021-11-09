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
    pinned: {
      type: GraphQLBoolean,
      description: 'True if agenda item has been pinned'
    },
    isActive: {
      type: GraphQLBoolean,
      description: 'True if not processed or deleted'
    },
    sortOrder: {
      type: GraphQLFloat,
      description: 'The sort order of the agenda item in the list'
    }
  })
})

export type UpdateAgendaItemInputType = {
  id: string
  content?: string | null
  pinned?: boolean
  isActive?: boolean | null
  sortOrder?: number | null
}

export default UpdateAgendaItemInput
