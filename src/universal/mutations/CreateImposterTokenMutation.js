import {commitMutation} from 'react-relay';
import signinAndUpdateToken from 'universal/components/Auth0ShowLock/signinAndUpdateToken';
import signout from 'universal/containers/Signout/signout';
import {showError} from 'universal/modules/toast/ducks/toastDuck';
import getGraphQLError from 'universal/utils/relay/getGraphQLError';

graphql`
  fragment CreateImposterTokenMutation_agendaItem on CreateImposterTokenPayload {
    authToken
    user {
      id
      email
      preferredName
    }
  }
`;

const mutation = graphql`
  mutation CreateImposterTokenMutation($userId: ID!) {
    createImposterToken(userId: $userId) {
      error {
        message
      }
      ...CreateImposterTokenMutation_agendaItem @relay(mask: false)
    }
  }
`;

const CreateImposterTokenMutation = (environment, userId, {dispatch, history, location}) => {
  const onError = (err) => {
    dispatch(showError({title: 'Whoa there!', message: err.message}));
  };

  return commitMutation(environment, {
    mutation,
    variables: {userId},
    onCompleted: async (res, errors) => {
      const serverError = getGraphQLError(res, errors);
      if (serverError) {
        onError(serverError);
        return;
      }
      const {createImposterToken} = res;
      const {authToken} = createImposterToken;

      // Reset application state:
      await signout(environment, dispatch);

      // Assume the identity of the new user:
      await signinAndUpdateToken(environment, dispatch, history, location, authToken);

      // Navigate to a default location, the application root:
      history.replace('/');
    },
    onError
  });
};

export default CreateImposterTokenMutation;
