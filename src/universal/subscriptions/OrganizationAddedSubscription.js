import {addOrgUpdater} from 'universal/mutations/AddOrgMutation';

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
      addOrgUpdater(store, viewerId, newNode);
    }
  };
};

export default OrganizationAddedSubscription;
