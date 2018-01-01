import handleAddOrganization from 'universal/mutations/handlers/handleAddOrganization';
import handleRemoveOrganization from 'universal/mutations/handlers/handleRemoveOrganization';
import getInProxy from 'universal/utils/relay/getInProxy';

const subscription = graphql`
  subscription OrganizationSubscription {
    organizationSubscription {
      __typename
      ...on OrganizationAdded {
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
      ... on OrganizationUpdated {
        organization {
          id
          name
          picture
          tier
        }
        updatedOrgMember {
          isBillingLeader
        }
      }
      ... on OrganizationRemoved {
        organization {
          id
        }
      }
    }
  }
`;

const OrganizationSubscription = (environment) => {
  const {viewerId} = environment;
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('organizationSubscription');
      const organization = payload.getLinkedRecord('organization');
      const type = payload.getLinkedRecord('__typename');
      if (type === 'OrganizationAdded') {
        handleAddOrganization(organization, store, viewerId);
      } else if (type === 'OrganizationRemoved') {
        const organizationId = getInProxy(organization, 'id');
        handleRemoveOrganization(organizationId, store, viewerId);
      }
    }
  };
};

export default OrganizationSubscription;
