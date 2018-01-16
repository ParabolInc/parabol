import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation CreateFirstTeamMutation($newTeam: NewTeamInput!) {
    createFirstTeam(newTeam: $newTeam) {
      team {
        id
        name
      }
      teamLead {
        id
        picture
        preferredName
      }
      jwt
      user {
        ...UserAnalyticsFrag @relay(mask: false)
      }
    }
  }
`;

const CreateFirstTeamMutation = (environment, newTeam, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {newTeam},
    onCompleted,
    onError
  });
};

export default CreateFirstTeamMutation;
