import {commitMutation} from 'react-relay'
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
      meetingId
      newMeeting {
        id
      }
    }
  }
`

const mutation = graphql`
  mutation EndNewMeetingMutation($meetingId: ID!) {
    endNewMeeting(meetingId: $meetingId) {
      error {
        message
      }
      ...EndNewMeetingMutation_team @relay(mask: false)
    }
  }
`

export const popEndNewMeetingToast = (atmosphere) => {
  atmosphere.eventEmitter.emit('addToast', {
    level: 'info',
    autoDismiss: 10,
    title: 'It’s dead!',
    message: `You killed the meeting.
    Just like your goldfish.`,
    action: {label: 'Good.'}
  })
}

export const endNewMeetingTeamOnNext = (payload, context) => {
  const {error, isKill, meeting} = payload
  const {atmosphere, history} = context
  handleMutationError(error, context)
  if (!meeting) return
  const {id: meetingId} = meeting
  if (isKill) {
    const {meetingSlug, teamId} = getMeetingPathParams()
    if (teamId === 'demo') {
      window.localStorage.removeItem('retroDemo')
      history.push('/create-account')
    } else {
      history.push(`/${meetingSlug}/${teamId}`)
      popEndNewMeetingToast(atmosphere)
    }
  } else {
    if (meetingId === 'demoMeeting') {
      history.push('/retrospective-demo-summary')
    } else {
      history.push(`/new-summary/${meetingId}`)
    }
  }
}

const EndNewMeetingMutation = (atmosphere, variables, context, onError, onCompleted) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      endNewMeetingTeamOnNext(res.endNewMeeting, {...context, atmosphere})
    },
    onError
  })
}

export default EndNewMeetingMutation
