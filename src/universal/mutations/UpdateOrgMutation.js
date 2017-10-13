import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation UpdateOrgMutation($updatedOrg: UpdateOrgInput!) {
    updateOrg(updatedOrg: $updatedOrg) {
      organization {
        id
        name
        picture
      }
    }
  }
`;

const UpdateOrgMutation = (environment, updatedOrg, onCompleted, onError) => {
  return commitMutation(environment, {
    mutation,
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
    variables: {updatedOrg},
    onCompleted,
    onError
  });
};

export default UpdateOrgMutation;
