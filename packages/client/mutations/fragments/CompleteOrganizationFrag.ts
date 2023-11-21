import graphql from 'babel-plugin-relay/macro'
graphql`
  fragment CompleteOrganizationFrag on Organization {
    id
    isBillingLeader
    billingLeaders {
      id
    }
    createdAt
    name
    orgUserCount {
      activeUserCount
      inactiveUserCount
    }
    picture
    creditCard {
      brand
      expiry
      last4
    }
    periodStart
    periodEnd
    tier
  }
`
