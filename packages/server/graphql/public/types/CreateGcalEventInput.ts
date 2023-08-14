import {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLList
} from 'graphql'
import GraphQLEmailType from '../../types/GraphQLEmailType'

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
    timeZone: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The timeZone of the meeting'
    },
    emails: {
      type: new GraphQLList(GraphQLEmailType),
      description:
        'The email addresses that will be invited to the gcal event. If not provided, no one will be invited'
    }
  })
})

export type CreateGcalEventInputType = {
  title: string
  description: string
  startTimestamp: number
  endTimestamp: number
  timeZone: string
  emails?: string[]
}

export default CreateGcalEventInput
