import {commitMutation, graphql} from 'react-relay'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'

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
    unlockedStages {
      id
      isNavigable
      isNavigableByFacilitator
    }
  }
`

const mutation = graphql`
  mutation VoteForReflectionGroupMutation($reflectionGroupId: ID!, $isUnvote: Boolean) {
    voteForReflectionGroup(reflectionGroupId: $reflectionGroupId, isUnvote: $isUnvote) {
      ...VoteForReflectionGroupMutation_team @relay(mask: false)
    }
  }
`

const VoteForReflectionGroupMutation = (atmosphere, variables, context, onError, onCompleted) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {reflectionGroupId, isUnvote} = variables
      const {meetingId} = context
      const reflectionGroupProxy = store.get(reflectionGroupId)
      if (!reflectionGroupProxy) return
      const increment = isUnvote ? -1 : 1
      const meetingMemberId = toTeamMemberId(meetingId, viewerId)
      const meetingMemberProxy = store.get(meetingMemberId)
      const viewerVoteCount = reflectionGroupProxy.getValue('viewerVoteCount') || 0
      const votesRemaining = meetingMemberProxy.getValue('votesRemaining') || 0
      reflectionGroupProxy.setValue(viewerVoteCount + increment, 'viewerVoteCount')
      meetingMemberProxy.setValue(votesRemaining - increment, 'votesRemaining')
    }
  })
}

export default VoteForReflectionGroupMutation
