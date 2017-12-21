import {handleRemoveOrgUser} from 'universal/mutations/RemoveOrgUserMutation';

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
      removedOrgUser {
        id
      }
    }
  }
`;

const OrganizationUpdatedSubscription = (environment, queryVariables, subParams) => {
  const {orgId} = subParams;
  return {
    subscription,
    variables: {orgId},
    updater: (store) => {
      const payload = store.getRootField('organizationUpdated');
      const removedOrgUser = payload.getLinkedRecord('removedOrgUser');
      if (removedOrgUser) {
        const removedOrgUserId = removedOrgUser.getValue('id');
        handleRemoveOrgUser(store, orgId, removedOrgUserId);
      }
    }
  };
};

export default OrganizationUpdatedSubscription;
