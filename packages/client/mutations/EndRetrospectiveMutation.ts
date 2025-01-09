import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {RecordProxy} from 'relay-runtime'
import {EndRetrospectiveMutation_notification$data} from '~/__generated__/EndRetrospectiveMutation_notification.graphql'
import {EndRetrospectiveMutation_team$data} from '~/__generated__/EndRetrospectiveMutation_team.graphql'
import onMeetingRoute from '~/utils/onMeetingRoute'
import {EndRetrospectiveMutation as TEndRetrospectiveMutation} from '../__generated__/EndRetrospectiveMutation.graphql'
import {RetroDemo} from '../types/constEnums'
import {
  HistoryMaybeLocalHandler,
  OnNextHandler,
  OnNextHistoryContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import handleAddTimelineEvent from './handlers/handleAddTimelineEvent'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'
import popEndMeetingToast from './toasts/popEndMeetingToast'

graphql`
  fragment EndRetrospectiveMutation_team on EndRetrospectiveSuccess {
    isKill
    meeting {
      id
      endedAt
      teamId
      commentCount
      reflectionCount
      taskCount
      topicCount
      organization {
        useAI
      }
      reflectionGroups(sortBy: voteCount) {
        reflections {
          id
        }
      }
      transcription {
        speaker
        words
      }
      phases {
        phaseType
      }
    }
    team {
      ...TeamInsights_team
      id
      activeMeetings {
        id
      }
    }
    timelineEvent {
      ...TimelineEventCompletedRetroMeeting_timelineEvent @relay(mask: false)
    }
  }
`

graphql`
  fragment EndRetrospectiveMutation_notification on EndRetrospectiveSuccess {
    removedSuggestedActionId
  }
`

graphql`
  fragment EndRetrospectiveMutation_meeting on EndRetrospectiveSuccess {
    meeting {
      ...WholeMeetingSummary_meeting
      taskCount
    }
  }
`

const mutation = graphql`
  mutation EndRetrospectiveMutation($meetingId: ID!) {
    endRetrospective(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...EndRetrospectiveMutation_notification @relay(mask: false)
      ...EndRetrospectiveMutation_team @relay(mask: false)
      ...EndRetrospectiveMutation_meeting @relay(mask: false)
    }
  }
`

export const endRetrospectiveTeamOnNext: OnNextHandler<
  EndRetrospectiveMutation_team$data,
  OnNextHistoryContext
> = (payload, context) => {
  const {isKill, meeting} = payload
  const {atmosphere, history} = context
  if (!meeting) return
  const {id: meetingId, teamId, reflectionGroups, phases, organization} = meeting
  if (meetingId === RetroDemo.MEETING_ID) {
    if (isKill) {
      window.localStorage.removeItem('retroDemo')
      history.push('/create-account')
    } else {
      history.push('/retrospective-demo-summary')
    }
  } else if (onMeetingRoute(window.location.pathname, [meetingId])) {
    if (isKill) {
      history.push(`/team/${teamId}`)
      popEndMeetingToast(atmosphere, meetingId)
    } else {
      const reflections = reflectionGroups.flatMap((group) => group.reflections) // reflectionCount hasn't been calculated yet so check reflections length
      const hasMoreThanOneReflection = reflections.length > 1
      const hasOpenAISummary =
        hasMoreThanOneReflection && organization.useAI && window.__ACTION__.hasOpenAI
      const hasTeamHealth = phases.some((phase) => phase.phaseType === 'TEAM_HEALTH')
      const pathname = `/new-summary/${meetingId}`
      const search = new URLSearchParams()
      if (hasOpenAISummary) {
        search.append('ai', 'true')
      }
      if (hasTeamHealth) {
        search.append('team-health', 'true')
      }
      history.push({
        pathname,
        search: search.toString()
      })
    }
  }
}

export const endRetrospectiveNotificationUpdater: SharedUpdater<
  EndRetrospectiveMutation_notification$data
> = (payload, {store}) => {
  const removedSuggestedActionId = payload.getValue('removedSuggestedActionId')
  handleRemoveSuggestedActions(removedSuggestedActionId, store)
}

export const endRetrospectiveTeamUpdater: SharedUpdater<EndRetrospectiveMutation_team$data> = (
  payload,
  {store}
) => {
  const meeting = payload.getLinkedRecord('meeting') as RecordProxy
  const timelineEvent = payload.getLinkedRecord('timelineEvent') as RecordProxy
  handleAddTimelineEvent(meeting, timelineEvent, store)
}

const EndRetrospectiveMutation: StandardMutation<
  TEndRetrospectiveMutation,
  HistoryMaybeLocalHandler
> = (atmosphere, variables, {onError, onCompleted, history}) => {
  return commitMutation<TEndRetrospectiveMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('endRetrospective')
      if (!payload) return
      const context = {atmosphere, store: store as any}
      endRetrospectiveNotificationUpdater(payload as any, context)
      endRetrospectiveTeamUpdater(payload as any, context)
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      endRetrospectiveTeamOnNext(res.endRetrospective as any, {atmosphere, history})
    },
    onError
  })
}

export default EndRetrospectiveMutation
