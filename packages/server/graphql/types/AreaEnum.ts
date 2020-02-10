import {GraphQLEnumType} from 'graphql'
import {MEETING, TEAM_DASH, USER_DASH} from 'parabol-client/utils/constants'

const AreaEnum = new GraphQLEnumType({
  name: 'AreaEnum',
  description: 'The part of the site that is calling the mutation',
  values: {
    [MEETING]: {},
    [TEAM_DASH]: {},
    [USER_DASH]: {}
  }
})

export default AreaEnum
