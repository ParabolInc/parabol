import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import Atmosphere from '~/Atmosphere'
import {SharedUpdater, SimpleMutation} from '../types/relayMutations'
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
  mutation ResetRetroMeetingToGroupStageMutation($meetingId: ID!) {
    resetRetroMeetingToGroupStage(meetingId: $meetingId) {
      error {
        message
      }
      ...ResetRetroMeetingToGroupStageMutation_meeting @relay(mask: false)
    }
  }
`

export const resetRetroMeetingToGroupStageUpdater: SharedUpdater<TResetRetroMeetingToGroupStageMutation['response']['resetRetroMeetingToGroupStage']> = (
  payload,
  {store}
) => {
  const meeting = payload.getLinkedRecord('meeting')
  if (!meeting) return
  const phases = meeting.getLinkedRecords('phases')
  if (!phases) return
  const discussPhase = phases.find((phase) => phase?.getValue('phaseType') === 'discuss')
  if (!discussPhase) return
  const stages = discussPhase.getLinkedRecords('stages')
  stages.forEach((stage) => {
    const discussionId = stage?.getValue('discussionId') as string
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
      resetRetroMeetingToGroupStageUpdater(payload, {store, atmosphere})
    },
    variables
  })
}

export default ResetRetroMeetingToGroupStageMutation
