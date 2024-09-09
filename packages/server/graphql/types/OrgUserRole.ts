import {GraphQLEnumType} from 'graphql'

const OrgUserRole = new GraphQLEnumType({
  name: 'OrgUserRole',
  description: 'The role of the org user',
  values: {
    // graphql only supports enum values at runtime, the value here is the text value
    BILLING_LEADER: {},
    ORG_ADMIN: {}
  }
})

export default OrgUserRole
