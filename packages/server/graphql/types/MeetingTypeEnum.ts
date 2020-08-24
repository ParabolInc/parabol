import {GraphQLEnumType} from 'graphql'

const MeetingTypeEnum = new GraphQLEnumType({
  name: 'MeetingTypeEnum',
  description: 'The type of meeting',
  values: {
    action: {},
    retrospective: {},
    poker: {}
  }
})

export default MeetingTypeEnum
