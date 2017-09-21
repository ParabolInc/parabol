import {commitMutation} from 'react-relay';
import {GITHUB, SLACK} from 'universal/utils/constants';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';
import getArrayWithoutIds from 'universal/utils/relay/getArrayWithoutIds';
import toGlobalId from 'universal/utils/relay/toGlobalId';

const mutation = graphql`
  mutation RemoveTeamMemberMutation($teamMemberId: ID!) {
    removeTeamMember(teamMemberId: $teamMemberId)
  }
`;


const RemoveTeamMemberMutation = (environment, teamMemberId, onCompleted, onError) => {
  //const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {teamMemberId},
    //updater: (store) => {

    //},
  });
};

export default RemoveTeamMemberMutation;
