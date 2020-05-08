import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SimpleMutation, SharedUpdater} from '../types/relayMutations'
import {ArchiveTimelineEventMutation as TArchiveTimelineEventMutation} from '../__generated__/ArchiveTimelineEventMutation.graphql'
import getUserTimelineEventsConn from './connections/getUserTimelineEventsConn'
import safeRemoveNodeFromConn from 'utils/relay/safeRemoveNodeFromConn'
import {ArchiveTimelineEventMutation_timelineEvent} from '__generated__/ArchiveTimelineEventMutation_timelineEvent.graphql'

graphql`
  fragment ArchiveTimelineEventMutation_timelineEvent on ArchiveTimelineEventSuccess {
    timelineEvent {
      id
      isActive
    }
  }
`

const mutation = graphql`
  mutation ArchiveTimelineEventMutation($timelineEventId: ID!, $meetingId: ID!, $teamId: ID!) {
    archiveTimelineEvent(
      timelineEventId: $timelineEventId
      meetingId: $meetingId
      teamId: $teamId
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...ArchiveTimelineEventMutation_timelineEvent @relay(mask: false)
    }
  }
`

export const archiveTimelineEventUpdater: SharedUpdater<ArchiveTimelineEventMutation_timelineEvent> = (
  payload,
  {store}
) => {
  const timelineEvent = payload.getLinkedRecord('timelineEvent')
  if (!timelineEvent) return
  const timelineEventId = timelineEvent.getValue('id')
  handleRemoveTimelineEvent(timelineEventId, store)
}

const handleRemoveTimelineEvent = (timelineEventId, store) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const timelineEventsConn = getUserTimelineEventsConn(viewer)
  safeRemoveNodeFromConn(timelineEventId, timelineEventsConn)
}

const ArchiveTimelineEventMutation: SimpleMutation<TArchiveTimelineEventMutation> = (
  atmosphere,
  {timelineEventId, meetingId, teamId}
) => {
  return commitMutation<TArchiveTimelineEventMutation>(atmosphere, {
    mutation,
    variables: {
      timelineEventId,
      meetingId,
      teamId
    },
    updater: (store) => {
      const payload = store.getRootField('archiveTimelineEvent')
      archiveTimelineEventUpdater(payload as any, {atmosphere, store})
    },
    optimisticUpdater: (store) => handleRemoveTimelineEvent(timelineEventId, store)
  })
}

export default ArchiveTimelineEventMutation
