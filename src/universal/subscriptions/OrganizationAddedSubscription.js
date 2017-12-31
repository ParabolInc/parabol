import handleAddOrganization from 'universal/mutations/handlers/handleAddOrganization';

const subscription = graphql`
  subscription OrganizationAddedSubscription {
    organizationAdded {
      organization {
        id
        name
        orgUserCount {
          activeUserCount
          inactiveUserCount
        }
        picture
        tier
      }
    }
  }
`;

const OrganizationAddedSubscription = (environment) => {
  const {viewerId} = environment;
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const newNode = store.getRootField('organizationAdded').getLinkedRecord('organization');
      handleAddOrganization(newNode, store, viewerId);
    }
  };
};

export default OrganizationAddedSubscription;
