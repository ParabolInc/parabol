const subscription = graphql`
  subscription OrganizationUpdatedSubscription {
    organizationUpdated {
      organization {
        id
        name
        picture
        tier
      }
    }
  }
`;

const OrganizationUpdatedSubscription = () => {
  return {
    subscription,
    variables: {}
  };
};

export default OrganizationUpdatedSubscription;
