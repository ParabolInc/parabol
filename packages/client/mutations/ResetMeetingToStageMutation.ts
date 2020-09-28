import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SimpleMutation} from '../types/relayMutations'
import {ResetMeetingToStageMutation as TResetMeetingToStageMutation} from '../__generated__/ResetMeetingToStageMutation.graphql'

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
          thread(first: 1000) @connection(key: "DiscussionThread_thread") {
            edges {
              node {
                id
                threadId
                threadSource
              }
            }
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
      ...ResetMeetingToStageMutation_meeting
    }
  }
`

const ResetMeetingToStageMutation: SimpleMutation<TResetMeetingToStageMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('resetMeetingToStage')
      console.log('payload:', payload)
      const {meetingId} = variables
      const meeting = store.get(meetingId)
      if (!meeting) return
      const reflectionGroups = meeting.getLinkedRecords('reflectionGroups')
      if (!reflectionGroups) return
      reflectionGroups.forEach((rg) => rg.setValue(0, 'viewerVoteCount'))
      // const viewer = store.getRoot().getLinkedRecord('viewer')
      // if (!viewer) return
      // const meetingMember = store.get(`${viewer.getValue('id')}::${meetingId}`)
      // if (!meetingMember) return
      // meetingMember.setValue(meeting.getValue('totalVotes'), 'votesRemaining')
    }
    // optimisticUpdater: (store) => {
    // console.log('optimistically updating undo')
    // const {meetingId, stageId} = variables
    // const viewer = store.getRoot().getLinkedRecord('viewer')
    // if (!viewer) return
    // const meetingMember = store.get(`${viewer.getValue('id')}::${meetingId}`)
    // if (!meetingMember) return
    // meetingMember.setValue(5, 'votesRemaining')
    // console.log('total votes:', meetingMember.getValue('totalVotes'))

    // const meeting = store.get(meetingId)
    // if (!meeting) return
    // meeting.setValue(meeting.getValue('totalVotes'), 'votesRemaining')
    // const phases = meeting.getLinkedRecords('phases')
    // if (!phases) return
    // let shouldResetStage = false

    // for (let i = 0; i < phases.length; i++) {
    //   const phase = phases[i]
    //   if (!phase) continue
    //   const stages = phase.getLinkedRecords('stages')
    //   if (!stages) continue

    //   for (let j = 0; j < stages.length; j++) {
    //     const stage = stages[j]
    //     if (stage.getValue('id') === stageId) shouldResetStage = true
    //     if (shouldResetStage) stage.setValue(false, 'isComplete')
    //   }
    // }
    // }
  })
}

export default ResetMeetingToStageMutation
