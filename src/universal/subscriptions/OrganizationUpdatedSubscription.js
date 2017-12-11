const subscription = graphql`
  subscription OrganizationUpdatedSubscription($orgId: ID!) {
    organizationUpdated(orgId: $orgId) {
      organization {
        id
        name
        picture
        tier
      }
      updatedOrgUser {
        id
        isBillingLeader(orgId: $orgId)
      }
    }
  }
`;

const OrganizationUpdatedSubscription = (environment, queryVariables, subParams) => {
  const {orgId} = subParams;
  return {
    subscription,
    variables: {orgId}
  };
};

export default OrganizationUpdatedSubscription;
