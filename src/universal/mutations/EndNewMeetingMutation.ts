import {commitMutation, graphql} from 'react-relay'
import getMeetingPathParams from 'universal/utils/meetings/getMeetingPathParams'
import handleMutationError from 'universal/mutations/handlers/handleMutationError'
import handleRemoveSuggestedActions from 'universal/mutations/handlers/handleRemoveSuggestedActions'
import Atmosphere from 'universal/Atmosphere'
import {IEndNewMeetingOnMutationArguments} from 'universal/types/graphql'
import {LocalHandlers} from 'universal/types/relayMutations'
import {EndNewMeetingMutation} from '__generated__/EndNewMeetingMutation.graphql'

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

graphql`
  fragment EndNewMeetingMutation_notification on EndNewMeetingPayload {
    removedSuggestedActionId
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

export const endNewMeetingNotificationUpdater = (payload, {store}) => {
  const removedSuggestedActionId = payload.getValue('removedSuggestedActionId')
  handleRemoveSuggestedActions(removedSuggestedActionId, store)
}

const EndNewMeetingMutation = (
  atmosphere: Atmosphere,
  variables: IEndNewMeetingOnMutationArguments,
  {onError, onCompleted, history}: LocalHandlers
) => {
  return commitMutation<EndNewMeetingMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('endNewMeeting')
      if (!payload) return
      endNewMeetingNotificationUpdater(payload, {store})
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      endNewMeetingTeamOnNext(res.endNewMeeting, {atmosphere, history})
    },
    onError
  })
}

export default EndNewMeetingMutation
