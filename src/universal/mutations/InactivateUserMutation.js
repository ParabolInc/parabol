import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation InactivateUserMutation($userId: ID!) {
    inactivateUser(userId: $userId)
  }
`;

const InactivateUserMutation = (environment, userId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {userId},
    // updater: (store) => {
    //  const payload = store.getRootField('acceptTeamInviteEmail');
    //  const authToken = payload.getValue('authToken');
    //  const teamId = payload.getValue('teamId');
    //  const {tms} = jwtDecode(authToken);
    //  dispatch(setAuthToken(authToken));
    //  if (tms.length <= 1) {
    //    dispatch(showSuccess(successfulJoin));
    //    dispatch(setWelcomeActivity(`/team/${teamId}`));
    //    history.push('/me/settings');
    //  } else {
    //    dispatch(showSuccess(successfulExistingJoin));
    //    history.push(`/team/${teamId}`);
    //  }
    // },
    // optimisticUpdater: (store) => {
    // },
    onCompleted,
    onError
  });
};

export default InactivateUserMutation;
