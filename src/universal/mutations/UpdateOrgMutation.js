import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation UpdateOrgMutation($updatedOrg: UpdateOrgInput!) {
    updateOrg(updatedOrg: $updatedOrg) {
      organization {
        name
        picture
      }
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
