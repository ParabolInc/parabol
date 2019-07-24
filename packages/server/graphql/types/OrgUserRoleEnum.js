import {GraphQLEnumType} from 'graphql'
import {BILLING_LEADER} from '../../../client/utils/constants'

const OrgUserRole = new GraphQLEnumType({
  name: 'OrgUserRole',
  description: 'The role of the org user',
  values: {
    [BILLING_LEADER]: {}
  }
})

export default OrgUserRole
