import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation CreateUserPicturePutUrlMutation($contentType: String!, $contentLength: Int!) {
    createUserPicturePutUrl(contentType: $contentType, contentLength: $contentLength) {
      error {
        message
      }
      url
    }
  }
`;

const CreateUserPicturePutUrlMutation = (environment, variables, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
    onError
  });
};

export default CreateUserPicturePutUrlMutation;
