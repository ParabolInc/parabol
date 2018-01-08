graphql`
  fragment CompleteOrganizationFrag on Organization {
    id
    isBillingLeader
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
`;
