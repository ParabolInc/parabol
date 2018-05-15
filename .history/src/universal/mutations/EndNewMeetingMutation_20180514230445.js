import {commitMutation} from 'react-relay'
import {showInfo} from 'universal/modules/toast/ducks/toastDuck'
import getMeetingPathParams from 'universal/utils/meetings/getMeetingPathParams'
import handleMutationError from 'universal/mutations/handlers/handleMutationError'

graphql`
  fragment EndNewMeetingMutation_team on EndNewMeetingPayload {
    isKill
    meeting {
      id
    }
    team {
      id
      n
      meetingId
      newMeeting {
        id
      }
    }
  }
`

const mutation = graphql`
  mutation EndNewMeetingMutation($meetingId: ID!) {`
    endNewMeeting(meetingId: $meetingId) {
      error {
        message
      }
      ...EndNewMeetingMutation_team @relay(mask: false)
    }
  }
`

export const popEndNewMeetingToast = (dispatch) => {
  dispatch(
    showInfo({
      autoDismiss: 10,
      title: 'It’s dead!',
      message: `You killed the meeting. 
    Just like your goldfish.`,
      action: {label: 'Good.'}
    })
  )
}

export const endNewMeetingTeamOnNext = (payload, context) => {
  const {error, isKill, meeting} = payload
  const {history, dispatch} = context
  handleMutationError(error, context)
  if (!meeting) return
  const {id: meetingId} = meeting
  if (isKill) {
    const {meetingSlug, teamId} = getMeetingPathParams()
    history.push(`/${meetingSlug}/${teamId}`)
    popEndNewMeetingToast(dispatch)
  } else {
    history.push(`/new-summary/${meetingId}`)
  }
}

const EndNewMeetingMutation = (environment, variables, context, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      endNewMeetingTeamOnNext(res.endNewMeeting, context)
    },
    onError
  })
}

export default EndNewMeetingMutation
