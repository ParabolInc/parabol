export default graphql`
  fragment CompleteOrganizationFrag on Organization {
    id
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
