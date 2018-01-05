import {commitMutation} from 'react-relay';

graphql`
  fragment UpdateOrgMutation_organization on UpdateOrgPayload{
    organization {
      name
      picture
    }
  }
`;

const mutation = graphql`
  mutation UpdateOrgMutation($updatedOrg: UpdateOrgInput!) {
    updateOrg(updatedOrg: $updatedOrg) {
      ...UpdateOrgMutation_organization @relay(mask: false)
    }
  }
`;

const UpdateOrgMutation = (environment, updatedOrg, onCompleted, onError) => {
  return commitMutation(environment, {
    mutation,
    variables: {updatedOrg},
    optimisticUpdater: (store) => {
      const {id, picture, name} = updatedOrg;
      const organization = store.get(id);
      if (!organization) return;
      if (picture) {
        organization.setValue(picture, 'picture');
      }
      if (name) {
        organization.setValue(name, 'name');
      }
    },
    onCompleted,
    onError
  });
};

export default UpdateOrgMutation;
