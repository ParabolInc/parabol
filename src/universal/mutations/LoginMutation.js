import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation LoginMutation($auth0Token: String!) {
    login(auth0Token: $auth0Token) {
      user {
        ...UserAnalyticsFrag @relay(mask: false)
      }
    }
  }
`;

const LoginMutation = (environment, auth0Token, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {auth0Token},
    onCompleted,
    onError
  });
};

export default LoginMutation;
