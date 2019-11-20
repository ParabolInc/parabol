import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import {LocalHandlers} from '../types/relayMutations'
import {
  IRetroReflectionGroup,
  IRetrospectiveMeetingMember,
  IVoteForReflectionGroupOnMutationArguments
} from '../types/graphql'
import Atmosphere from '../Atmosphere'
import {VoteForReflectionGroupMutation as IVoteForReflectionGroupMutation} from '../__generated__/VoteForReflectionGroupMutation.graphql'

graphql`
  fragment VoteForReflectionGroupMutation_meeting on VoteForReflectionGroupPayload {
    error {
      message
      title
    }
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
      ...VoteForReflectionGroupMutation_meeting @relay(mask: false)
    }
  }
`

const VoteForReflectionGroupMutation = (
  atmosphere: Atmosphere,
  variables: IVoteForReflectionGroupOnMutationArguments,
  {onError, onCompleted, meetingId}: LocalHandlers & {meetingId: string}
) => {
  return commitMutation<IVoteForReflectionGroupMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {reflectionGroupId, isUnvote} = variables
      const reflectionGroupProxy = store.get<IRetroReflectionGroup>(reflectionGroupId)
      if (!reflectionGroupProxy) return
      const increment = isUnvote ? -1 : 1
      const meetingMemberId = toTeamMemberId(meetingId, viewerId)
      const meetingMemberProxy = store.get<IRetrospectiveMeetingMember>(meetingMemberId)
      if (!meetingMemberProxy) return
      const viewerVoteCount = reflectionGroupProxy.getValue('viewerVoteCount') || 0
      const votesRemaining = meetingMemberProxy.getValue('votesRemaining') || 0
      reflectionGroupProxy.setValue(viewerVoteCount + increment, 'viewerVoteCount')
      meetingMemberProxy.setValue(votesRemaining - increment, 'votesRemaining')
    }
  })
}

export default VoteForReflectionGroupMutation
