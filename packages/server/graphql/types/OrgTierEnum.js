import {GraphQLEnumType} from 'graphql'
import {PERSONAL, PRO, ENTERPRISE} from '../../../client/utils/constants'

const OrgTierEnum = new GraphQLEnumType({
  name: 'OrgTierEnum',
  description: 'The tier of the Organization',
  values: {
    [PERSONAL]: {},
    [PRO]: {},
    [ENTERPRISE]: {}
  }
})

export default OrgTierEnum
