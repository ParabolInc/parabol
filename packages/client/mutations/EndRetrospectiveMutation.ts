import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {RecordProxy} from 'relay-runtime'
import onMeetingRoute from '~/utils/onMeetingRoute'
import {EndRetrospectiveMutation_notification} from '~/__generated__/EndRetrospectiveMutation_notification.graphql'
import {EndRetrospectiveMutation_team} from '~/__generated__/EndRetrospectiveMutation_team.graphql'
import {RetroDemo} from '../types/constEnums'
import {
  HistoryMaybeLocalHandler,
  OnNextHandler,
  OnNextHistoryContext,
  SharedUpdater,
  StandardMutation
} from '../types/relayMutations'
import {EndRetrospectiveMutation as TEndRetrospectiveMutation} from '../__generated__/EndRetrospectiveMutation.graphql'
import handleAddTimelineEvent from './handlers/handleAddTimelineEvent'
import handleRemoveSuggestedActions from './handlers/handleRemoveSuggestedActions'
import popEndMeetingToast from './toasts/popEndMeetingToast'
import sendToSentry from '../../server/utils/sendToSentry'

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
      reflectionGroups(sortBy: voteCount) {
        id
        summary
        reflections {
          id
        }
      }
      phases {
        phaseType
        ... on DiscussPhase {
          stages {
            discussion {
              summary
            }
          }
        }
      }
    }
    team {
      id
      activeMeetings {
        id
      }
    }
    timelineEvent {
      id
      team {
        id
        name
      }
      type
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
  EndRetrospectiveMutation_team,
  OnNextHistoryContext
> = (payload, context) => {
  const {isKill, meeting} = payload
  const {atmosphere, history} = context
  if (!meeting) return
  const {id: meetingId, teamId, reflectionGroups, phases} = meeting
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
      const discussPhase = phases.find((phase) => phase.phaseType === 'discuss')
      const {stages} = discussPhase ?? {}
      const hasTopicSummary = reflectionGroups.some((group) => group.summary)
      const hasDiscussionSummary = !!stages?.some((stage) => stage.discussion?.summary)
      const hasOpenAISummary = hasTopicSummary || hasDiscussionSummary
      const groupsWithMissingTopicSummaries =
        hasTopicSummary &&
        reflectionGroups.filter((group) => group.reflections.length > 1 && !group.summary)
      if (groupsWithMissingTopicSummaries && groupsWithMissingTopicSummaries.length) {
        const {viewerId} = atmosphere
        const error = new Error('Missing AI topic summary')
        const missingGroupIds = groupsWithMissingTopicSummaries.map((group) => group.id).join(', ')
        sendToSentry(error, {
          userId: viewerId,
          tags: {missingGroupIds, meetingId}
        })
      }
      const pathname = `/new-summary/${meetingId}`
      const search = hasOpenAISummary ? '?ai=true' : ''
      history.push({
        pathname,
        search
      })
    }
  }
}

export const endRetrospectiveNotificationUpdater: SharedUpdater<
  EndRetrospectiveMutation_notification
> = (payload, {store}) => {
  const removedSuggestedActionId = payload.getValue('removedSuggestedActionId')
  handleRemoveSuggestedActions(removedSuggestedActionId, store)
}

export const endRetrospectiveTeamUpdater: SharedUpdater<EndRetrospectiveMutation_team> = (
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
