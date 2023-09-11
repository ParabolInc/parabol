import {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLList
} from 'graphql'
import GcalVideoTypeEnum from '../../types/GcalVideoTypeEnum'
import GraphQLEmailType from '../../types/GraphQLEmailType'

const CreateGcalEventInput = new GraphQLInputObjectType({
  name: 'CreateGcalEventInput',
  fields: () => ({
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the meeting'
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
    invitees: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLEmailType)),
      description:
        'The email addresses that will be invited to the gcal event. If not provided, no one will be invited'
    },
    videoType: {
      type: GcalVideoTypeEnum,
      description:
        'The type of video call to be used in the meeting. Null if no video call will be used'
    }
  })
})

type GcalVideoTypeEnum = 'meet' | 'zoom'

export type CreateGcalEventInputType = {
  title: string
  startTimestamp: number
  endTimestamp: number
  timeZone: string
  videoType?: GcalVideoTypeEnum
  invitees?: string[]
}

export default CreateGcalEventInput
