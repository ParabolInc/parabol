import {commitMutation} from 'react-relay';

graphql`
  fragment UpdateUserProfileMutation_notification on UpdateUserProfilePayload {
    user {
      preferredName
      picture
    }
  }
`;

graphql`
  fragment UpdateUserProfileMutation_teamMember on UpdateUserProfilePayload {
    teamMembers {
      preferredName
      picture
    }
  }
`;

const mutation = graphql`
  mutation UpdateUserProfileMutation($updatedUser: UpdateUserProfileInput!) {
    updateUserProfile(updatedUser: $updatedUser) {
      ...UpdateUserProfileMutation_notification @relay(mask: false)
      ...UpdateUserProfileMutation_teamMember @relay(mask: false)
    }
  }
`;

const UpdateUserProfileMutation = (environment, updatedUser, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {updatedUser},
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId);
      const {picture, preferredName} = updatedUser;
      if (preferredName) {
        viewer.setValue(preferredName, 'preferredName');
      }
      if (picture) {
        viewer.setValue(picture, 'picture');
      }
    },
    onCompleted,
    onError
  });
};

export default UpdateUserProfileMutation;
