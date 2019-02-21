import {PromoteNewMeetingFacilitatorMutation_team} from '__generated__/PromoteNewMeetingFacilitatorMutation_team.graphql'
import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'

graphql`
  fragment PromoteNewMeetingFacilitatorMutation_team on PromoteNewMeetingFacilitatorPayload {
    meeting {
      facilitatorUserId
      facilitator {
        id
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

export const promoteNewMeetingFacilitatorTeamOnNext = (
  payload: PromoteNewMeetingFacilitatorMutation_team,
  {atmosphere}
) => {
  const {viewerId} = atmosphere
  const {oldFacilitator, meeting} = payload
  if (!oldFacilitator || !meeting) return
  const {isConnected, preferredName: oldFacilitatorName} = oldFacilitator
  const {
    facilitator: {preferredName: newFacilitatorName, id: newFacilitatorUserId}
  } = meeting
  const isSelf = newFacilitatorUserId === viewerId
  const title = isConnected ? 'New facilitator!' : `${oldFacilitatorName} disconnected!`
  const intro = isSelf ? 'You are' : `${newFacilitatorName} is`
  atmosphere.eventEmitter.emit('addToast', {
    level: 'info',
    title,
    message: `${intro} the new facilitator`
  })
}

const PromoteNewMeetingFacilitatorMutation = (atmosphere, variables): Disposable => {
  return commitMutation(atmosphere, {
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
