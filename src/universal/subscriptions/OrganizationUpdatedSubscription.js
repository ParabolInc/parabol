const subscription = graphql`
  subscription OrganizationUpdatedSubscription {
    organizationUpdated {
      organization {
        id
        name
        picture
      }
    }
  }
`;

const OrganizationUpdatedSubscription = (environment) => {
  const {ensureSubscription} = environment;
  return ensureSubscription({
    subscription,
    variables: {}
  });
};

export default OrganizationUpdatedSubscription;
