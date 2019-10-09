import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import {LocalHandlers} from '../types/relayMutations'
import {IVoteForReflectionGroupOnMutationArguments} from '../types/graphql'
import Atmosphere from '../Atmosphere'

graphql`
  fragment VoteForReflectionGroupMutation_team on VoteForReflectionGroupPayload {
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
      ...VoteForReflectionGroupMutation_team @relay(mask: false)
    }
  }
`

const VoteForReflectionGroupMutation = (
  atmosphere: Atmosphere,
  variables: IVoteForReflectionGroupOnMutationArguments,
  {onError, onCompleted, meetingId}: LocalHandlers & {meetingId: string}
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {reflectionGroupId, isUnvote} = variables
      const reflectionGroupProxy = store.get(reflectionGroupId)
      if (!reflectionGroupProxy) return
      const increment = isUnvote ? -1 : 1
      const meetingMemberId = toTeamMemberId(meetingId, viewerId)
      const meetingMemberProxy = store.get(meetingMemberId)
      if (!meetingMemberProxy) return
      const viewerVoteCount = reflectionGroupProxy.getValue('viewerVoteCount') || 0
      const votesRemaining = meetingMemberProxy.getValue('votesRemaining') || 0
      reflectionGroupProxy.setValue(viewerVoteCount + increment, 'viewerVoteCount')
      meetingMemberProxy.setValue(votesRemaining - increment, 'votesRemaining')
    }
  })
}

export default VoteForReflectionGroupMutation
