import {
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import GcalVideoTypeEnum from '../../types/GcalVideoTypeEnum'
import GraphQLEmailType from '../../types/GraphQLEmailType'

const CreateGcalEventInput = new GraphQLInputObjectType({
  name: 'CreateGcalEventInput',
  fields: () => ({
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

export type CreateGcalEventInputType = {
  startTimestamp: number
  endTimestamp: number
  timeZone: string
  videoType?: 'meet' | 'zoom'
  invitees?: string[]
}

export default CreateGcalEventInput
