import {GraphQLEnumType} from 'graphql'
import {ACTION, RETROSPECTIVE} from 'parabol-client/utils/constants'

const MeetingTypeEnum = new GraphQLEnumType({
  name: 'MeetingTypeEnum',
  description: 'The type of meeting',
  values: {
    [ACTION]: {},
    [RETROSPECTIVE]: {}
  }
})

export default MeetingTypeEnum
