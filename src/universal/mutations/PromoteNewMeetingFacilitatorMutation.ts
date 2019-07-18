import {PromoteNewMeetingFacilitatorMutation_team} from '__generated__/PromoteNewMeetingFacilitatorMutation_team.graphql'
import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import {OnNextHandler, StandardMutation} from 'universal/types/relayMutations'
import {PromoteNewMeetingFacilitatorMutation as TPromoteNewMeetingFacilitatorMutation} from '__generated__/PromoteNewMeetingFacilitatorMutation.graphql'

graphql`
  fragment PromoteNewMeetingFacilitatorMutation_team on PromoteNewMeetingFacilitatorPayload {
    meeting {
      defaultFacilitatorUserId
      facilitatorUserId
      facilitator {
        # https://github.com/ParabolInc/action/issues/2984
        ...StageTimerModalEndTimeSlackToggle_facilitator
        userId
        preferredName
      }
    }
    oldFacilitator {
      isConnected
      preferredName
    }
  }
`

const mutation = graphql`
  mutation PromoteNewMeetingFacilitatorMutation($facilitatorUserId: ID!, $meetingId: ID!) {
    promoteNewMeetingFacilitator(facilitatorUserId: $facilitatorUserId, meetingId: $meetingId) {
      error {
        message
      }
      ...PromoteNewMeetingFacilitatorMutation_team @relay(mask: false)
    }
  }
`

export const promoteNewMeetingFacilitatorTeamOnNext: OnNextHandler<
  PromoteNewMeetingFacilitatorMutation_team
> = (payload, {atmosphere}) => {
  const {viewerId} = atmosphere
  const {oldFacilitator, meeting} = payload
  if (!oldFacilitator || !meeting) return
  const {isConnected, preferredName: oldFacilitatorName} = oldFacilitator
  const {
    facilitator: {preferredName: newFacilitatorName, userId: newFacilitatorUserId}
  } = meeting
  const isSelf = newFacilitatorUserId === viewerId
  const prefix = isConnected ? '' : `${oldFacilitatorName} disconnected! `
  const intro = isSelf ? 'You are' : `${newFacilitatorName} is`
  atmosphere.eventEmitter.emit('removeSnackbar', (snack) => snack.key.startsWith('newFacilitator'))
  atmosphere.eventEmitter.emit('addSnackbar', {
    autoDismiss: 5,
    key: `newFacilitator:${newFacilitatorUserId}`,
    message: `${prefix}${intro} the new facilitator`
  })
}

const PromoteNewMeetingFacilitatorMutation: StandardMutation<
  TPromoteNewMeetingFacilitatorMutation
> = (atmosphere, variables): Disposable => {
  return commitMutation<TPromoteNewMeetingFacilitatorMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId, facilitatorUserId} = variables
      const meeting = store.get(meetingId)
      if (!meeting) return
      meeting.setValue(facilitatorUserId, 'facilitatorUserId')
    },
    onCompleted: (res) => {
      const payload = res.promoteNewMeetingFacilitator
      if (payload) {
        promoteNewMeetingFacilitatorTeamOnNext(payload, {
          atmosphere
        })
      }
    }
  })
}

export default PromoteNewMeetingFacilitatorMutation
