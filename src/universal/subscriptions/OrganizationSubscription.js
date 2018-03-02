import {addOrgMutationOrganizationUpdater} from 'universal/mutations/AddOrgMutation';
import {approveToOrgOrganizationUpdater} from 'universal/mutations/ApproveToOrgMutation';
import {
  setOrgUserRoleAddedOrganizationUpdater,
  setOrgUserRoleRemovedOrganizationUpdater
} from 'universal/mutations/SetOrgUserRoleMutation';
import {removeOrgUserOrganizationUpdater} from 'universal/mutations/RemoveOrgUserMutation';

const subscription = graphql`
  subscription OrganizationSubscription {
    organizationSubscription {
      __typename
      ...AddOrgMutation_organization
      ...ApproveToOrgMutation_organization
      ...SetOrgUserRoleMutationAdded_organization
      ...SetOrgUserRoleMutationRemoved_organization
      ...UpdateCreditCardMutation_organization
      ...UpdateOrgMutation_organization
      ...UpgradeToProMutation_organization
      ...RemoveOrgUserMutation_organization
    }
  }
`;

const OrganizationSubscription = (environment, queryVariables, subParams) => {
  const {dispatch, history} = subParams;
  const {viewerId} = environment;
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('organizationSubscription');
      const type = payload.getValue('__typename');
      const options = {dispatch, history};
      switch (type) {
        case 'AddOrgPayload':
          addOrgMutationOrganizationUpdater(payload, store, viewerId);
          break;
        case 'ApproveToOrgPayload':
          approveToOrgOrganizationUpdater(payload, store, viewerId);
          break;
        case 'SetOrgUserRoleAddedPayload':
          setOrgUserRoleAddedOrganizationUpdater(payload, store, viewerId, options);
          break;
        case 'SetOrgUserRoleRemovedPayload':
          setOrgUserRoleRemovedOrganizationUpdater(payload, store, viewerId);
          break;
        case 'RemoveOrgUserPayload':
          removeOrgUserOrganizationUpdater(payload, store, viewerId);
          break;
        case 'UpdateCreditCardPayload':
          break;
        default:
          console.error('OrganizationSubscription case fail', type);
      }
    }
  };
};

export default OrganizationSubscription;
