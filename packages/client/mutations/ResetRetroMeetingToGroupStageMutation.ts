import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import Atmosphere from '~/Atmosphere'
import {SimpleMutation} from '../types/relayMutations'
import {
  ResetRetroMeetingToGroupStageMutation as TResetRetroMeetingToGroupStageMutation,
  ResetRetroMeetingToGroupStageMutationVariables
} from '../__generated__/ResetRetroMeetingToGroupStageMutation.graphql'
import getDiscussionThreadConn from './connections/getDiscussionThreadConn'

graphql`
  fragment ResetRetroMeetingToGroupStageMutation_meeting on ResetRetroMeetingToGroupStagePayload {
    meeting {
      id
      phases {
        id
        stages {
          id
          isComplete
          isNavigable
          isNavigableByFacilitator
        }
      }
      ... on RetrospectiveMeeting {
        viewerMeetingMember {
          id
          votesRemaining
        }
        votesRemaining
        reflectionGroups {
          id
          meetingId
          viewerVoteCount
        }
      }
    }
  }
`

const mutation = graphql`
  mutation ResetRetroMeetingToGroupStageMutation($meetingId: ID!, $stageId: ID!) {
    resetRetroMeetingToGroupStage(meetingId: $meetingId, stageId: $stageId) {
      error {
        message
      }
      ...ResetRetroMeetingToGroupStageMutation_meeting @relay(mask: false)
    }
  }
`

export const resetRetroMeetingToGroupStageUpdater = (payload, {store}) => {
  const meeting = payload.getLinkedRecord('meeting')
  const phases = meeting.getLinkedRecords('phases')
  const discussPhase = phases.find((phase) => phase?.getValue('phaseType') === 'discuss')
  if (!discussPhase) return
  const stages = discussPhase.getLinkedRecords('stages')
  stages.forEach((stage) => {
    const discussionId = stage?.getValue('discussionId')
    const thread = getDiscussionThreadConn(store, discussionId)
    thread?.setLinkedRecords([], 'edges')
  })
}

const ResetRetroMeetingToGroupStageMutation: SimpleMutation<TResetRetroMeetingToGroupStageMutation> = (
  atmosphere: Atmosphere,
  variables: ResetRetroMeetingToGroupStageMutationVariables
) => {
  return commitMutation<TResetRetroMeetingToGroupStageMutation>(atmosphere, {
    mutation,
    updater: (store) => {
      const payload = store.getRootField('resetRetroMeetingToGroupStage')
      if (!payload) return
      resetRetroMeetingToGroupStageUpdater(payload, {store})
    },
    variables
  })
}

export default ResetRetroMeetingToGroupStageMutation
