import {commitMutation} from 'react-relay';

const mutation = graphql`
  mutation RemoveTeamMemberMutation($teamMemberId: ID!) {
    removeTeamMember(teamMemberId: $teamMemberId)
  }
`;


const RemoveTeamMemberMutation = (environment, teamMemberId) => {
  // const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {teamMemberId}
    // updater: (store) => {

    // },
  });
};

export default RemoveTeamMemberMutation;
