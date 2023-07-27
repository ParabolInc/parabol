import {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt
} from 'graphql'

const CreateGcalEventInput = new GraphQLInputObjectType({
  name: 'CreateGcalEventInput',
  fields: () => ({
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the meeting'
    },
    description: {
      type: GraphQLString,
      description: 'The description of the meeting'
    },
    startTimestamp: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The start dateTime of the meeting'
    },
    endTimestamp: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The end dateTime of the meeting'
    },
    inviteTeam: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether the users in the team should be invited in gcal'
    },
    timeZone: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The timeZone of the meeting'
    }
  })
})

export type CreateGcalEventInputType = {
  title: string
  description: string
  startTimestamp: number
  endTimestamp: number
  inviteTeam: boolean
  timeZone: string
}

export default CreateGcalEventInput
