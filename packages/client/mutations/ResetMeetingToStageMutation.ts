import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import Atmosphere from '~/Atmosphere'
import {SimpleMutation} from '../types/relayMutations'
import {
  ResetMeetingToStageMutation as TResetMeetingToStageMutation,
  ResetMeetingToStageMutationVariables
} from '../__generated__/ResetMeetingToStageMutation.graphql'
import getThreadSourceThreadConn from './connections/getThreadSourceThreadConn'

graphql`
  fragment ResetMeetingToStageMutation_meeting on ResetMeetingToStagePayload {
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
          tasks {
            id
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation ResetMeetingToStageMutation($meetingId: ID!, $stageId: ID!) {
    resetMeetingToStage(meetingId: $meetingId, stageId: $stageId) {
      error {
        message
      }
      ...ResetMeetingToStageMutation_meeting @relay(mask: false)
    }
  }
`

export const resetMeetingToStageUpdater = (payload, {store}) => {
  const meeting = payload.getLinkedRecord('meeting')
  const reflectionGroups = meeting.getLinkedRecords('reflectionGroups')
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!reflectionGroups || !viewer) return
  reflectionGroups.forEach((group) => {
    const threadId = group.getValue('id')
    const thread = getThreadSourceThreadConn(store, threadId)
    thread?.setLinkedRecords([], 'edges')
  })
}

const ResetMeetingToStageMutation: SimpleMutation<TResetMeetingToStageMutation> = (
  atmosphere: Atmosphere,
  variables: ResetMeetingToStageMutationVariables
) => {
  return commitMutation<TResetMeetingToStageMutation>(atmosphere, {
    mutation,
    updater: (store) => {
      const payload = store.getRootField('resetMeetingToStage')
      if (!payload) return
      resetMeetingToStageUpdater(payload, {store})
    },
    variables
  })
}

export default ResetMeetingToStageMutation
