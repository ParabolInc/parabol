import {commitMutation} from 'react-relay';
import signinAndUpdateToken from 'universal/components/Auth0ShowLock/signinAndUpdateToken';
import signout from 'universal/containers/Signout/signout';
import {showError} from 'universal/modules/toast/ducks/toastDuck';

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
      ...CreateImposterTokenMutation_agendaItem @relay(mask: false)
    }
  }
`;

const CreateImposterTokenMutation = (environment, userId, {dispatch, history}) => {
  return commitMutation(environment, {
    mutation,
    variables: {userId},
    onCompleted: async (res) => {
      const {createImposterToken} = res;
      const {authToken, user: {id, preferredName: name, picture: avatar, email}} = createImposterToken;
      const profile = {id, avatar, email, name};

      // Reset application state:
      await signout(environment, dispatch);

      // Assume the identity of the new user:
      await signinAndUpdateToken(environment, dispatch, profile, authToken);

      // Navigate to a default location, the application root:
      history.replace('/');
    },
    onError: (err) => {
      dispatch(showError({title: 'Whoa there!', message: err}));
    }
  });
};

export default CreateImposterTokenMutation;
