import {GraphQLEnumType} from 'graphql'
import {MeetingTypeEnum as TMeetingTypeEnum} from '../../postgres/types/Meeting'

const MeetingTypeEnum = new GraphQLEnumType({
  name: 'MeetingTypeEnum',
  description: 'The type of meeting',
  values: {
    action: {},
    retrospective: {},
    poker: {},
    teamPrompt: {}
  } as {[P in TMeetingTypeEnum]: any}
})

export default MeetingTypeEnum
