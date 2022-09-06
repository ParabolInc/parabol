import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'

export type CreateAgendaItemInputType = {
  content: string
  pinned: boolean
  teamId: string
  teamMemberId: string
  sortOrder?: number
  meetingId?: string
}

const CreateAgendaItemInput = new GraphQLInputObjectType({
  name: 'CreateAgendaItemInput',
  fields: () => ({
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The content of the agenda item'
    },
    descriptionContent: {
      type: GraphQLString,
      description: 'The description content of the agenda item'
    },
    pinned: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'True if the agenda item has been pinned'
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
    },
    meetingId: {
      type: GraphQLString,
      description: 'The meeting ID of the agenda item'
    }
  })
})

export default CreateAgendaItemInput
