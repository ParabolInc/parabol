import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import getMeetingPathParams from '../utils/meetings/getMeetingPathParams'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'
import Atmosphere from '../Atmosphere'
import {IEndNewMeetingOnMutationArguments} from '../types/graphql'
import {LocalHandlers, SharedUpdater} from '../types/relayMutations'
import {EndNewMeetingMutation as TEndNewMeetingMutation} from '../__generated__/EndNewMeetingMutation.graphql'
import handleUpsertTasks from './handlers/handleUpsertTasks'
import {EndNewMeetingMutation_team} from '__generated__/EndNewMeetingMutation_team.graphql'
import handleRemoveTasks from './handlers/handleRemoveTasks'

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
      agendaItems {
        id
      }
    }
    removedTaskIds
    updatedTasks {
      content
      tags
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

const popEndNewMeetingToast = (atmosphere: Atmosphere, meetingId: string) => {
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `meetingKilled:${meetingId}`,
    autoDismiss: 5,
    message: `The meeting has been terminated`
  })
}

export const endNewMeetingTeamOnNext = (payload, context) => {
  const {isKill, meeting} = payload
  const {atmosphere, history} = context
  if (!meeting) return
  const {id: meetingId} = meeting
  const {meetingSlug, teamId} = getMeetingPathParams()
  if (!meetingSlug) return
  if (isKill) {
    if (teamId === 'demo') {
      window.localStorage.removeItem('retroDemo')
      history.push('/create-account')
    } else {
      history.push(`/${meetingSlug}/${teamId}`)
      popEndNewMeetingToast(atmosphere, meetingId)
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

export const endNewMeetingTeamUpdater: SharedUpdater<EndNewMeetingMutation_team> = (
  payload,
  {store}
) => {
  const updatedTasks = payload.getLinkedRecords('updatedTasks')
  const removedTaskIds = payload.getValue('removedTaskIds')
  handleRemoveTasks(removedTaskIds as any, store)
  handleUpsertTasks(updatedTasks as any, store)
}

const EndNewMeetingMutation = (
  atmosphere: Atmosphere,
  variables: IEndNewMeetingOnMutationArguments,
  {onError, onCompleted, history}: LocalHandlers
) => {
  return commitMutation<TEndNewMeetingMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('endNewMeeting')
      if (!payload) return
      endNewMeetingNotificationUpdater(payload, {store})
      endNewMeetingTeamUpdater(payload, {atmosphere, store})
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
