import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {RecordProxy} from 'relay-runtime'
import type {EndRetrospectiveMutation_notification$data} from '~/__generated__/EndRetrospectiveMutation_notification.graphql'
import type {EndRetrospectiveMutation_team$data} from '~/__generated__/EndRetrospectiveMutation_team.graphql'
import onMeetingRoute from '~/utils/onMeetingRoute'
import type {EndRetrospectiveMutation as TEndRetrospectiveMutation} from '../__generated__/EndRetrospectiveMutation.graphql'
import {RetroDemo} from '../types/constEnums'
import type {
  NavigateMaybeLocalHandler,
  OnNextHandler,
  OnNextNavigateContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import {GQLID} from '../utils/GQLID'
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
      transcription {
        speaker
        words
      }
      summaryPageId
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
  OnNextNavigateContext
> = (payload, context) => {
  const {isKill, meeting} = payload
  const {atmosphere, navigate} = context
  if (!meeting) return
  const {id: meetingId, teamId, summaryPageId} = meeting
  if (meetingId === RetroDemo.MEETING_ID) {
    if (isKill) {
      window.localStorage.removeItem('retroDemo')
      navigate('/create-account')
    } else {
      navigate('/retrospective-demo-summary')
    }
  } else if (onMeetingRoute(window.location.pathname, [meetingId])) {
    if (isKill) {
      navigate(`/team/${teamId}`)
      popEndMeetingToast(atmosphere, meetingId)
    } else if (summaryPageId) {
      const pageCode = GQLID.fromKey(summaryPageId)[0]
      navigate(`/pages/${pageCode}`)
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
  NavigateMaybeLocalHandler
> = (atmosphere, variables, {onError, onCompleted, navigate}) => {
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
      endRetrospectiveTeamOnNext(res.endRetrospective as any, {
        atmosphere,
        navigate
      })
    },
    onError
  })
}

export default EndRetrospectiveMutation
