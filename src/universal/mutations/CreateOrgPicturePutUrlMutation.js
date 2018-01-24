import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation CreateOrgPicturePutUrlMutation($contentType: String!, $contentLength: Int!, $orgId: ID!) {
    createOrgPicturePutUrl(contentType: $contentType, contentLength: $contentLength, orgId: $orgId) {
      url
    }
  }
`;

const CreateOrgPicturePutUrlMutation = (environment, variables, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
    onError
  });
};

export default CreateOrgPicturePutUrlMutation;
