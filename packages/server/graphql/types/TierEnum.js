import {GraphQLEnumType} from 'graphql'
import {ENTERPRISE, PERSONAL, PRO} from '../../../client/utils/constants'

const TierEnum = new GraphQLEnumType({
  name: 'TierEnum',
  description: 'The pay tier of the team',
  values: {
    [PERSONAL]: {},
    [PRO]: {},
    [ENTERPRISE]: {}
  }
})

export default TierEnum
