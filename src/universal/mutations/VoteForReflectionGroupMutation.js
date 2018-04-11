import {commitMutation} from 'react-relay';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

graphql`
  fragment VoteForReflectionGroupMutation_team on VoteForReflectionGroupPayload {
    meeting {
      votesRemaining
    }
    meetingMember {
      votesRemaining
    }
    reflectionGroup {
      viewerVoteCount
      voteCount
    }
  }
`;

const mutation = graphql`
  mutation VoteForReflectionGroupMutation($reflectionGroupId: ID! $isUnvote: Boolean) {
    voteForReflectionGroup(reflectionGroupId: $reflectionGroupId, isUnvote: $isUnvote) {
      ...VoteForReflectionGroupMutation_team @relay(mask: false)
    }
  }
`;

const VoteForReflectionGroupMutation = (atmosphere, variables, context, onError, onCompleted) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere;
      const {reflectionGroupId, isUnvote} = variables;
      const {meetingId} = context;
      const reflectionGroupProxy = store.get(reflectionGroupId);
      if (!reflectionGroupProxy) return;
      const increment = isUnvote ? -1 : 1;
      const meetingMemberId = toTeamMemberId(meetingId, viewerId);
      const meetingMemberProxy = store.get(meetingMemberId);
      reflectionGroupProxy.setValue(reflectionGroupProxy.getValue('viewerVoteCount') + increment, 'viewerVoteCount');
      meetingMemberProxy.setValue(meetingMemberProxy.getValue('votesRemaining') - increment, 'votesRemaining');
    }
  });
};

export default VoteForReflectionGroupMutation;
