import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {ArchiveTimelineEventMutation_notification} from '__generated__/ArchiveTimelineEventMutation_notification.graphql'
import safeRemoveNodeFromConn from '~/utils/relay/safeRemoveNodeFromConn'
import {SharedUpdater, SimpleMutation} from '../types/relayMutations'
import {ArchiveTimelineEventMutation as TArchiveTimelineEventMutation} from '../__generated__/ArchiveTimelineEventMutation.graphql'
import getUserTimelineEventsConn from './connections/getUserTimelineEventsConn'

graphql`
  fragment ArchiveTimelineEventMutation_notification on ArchiveTimelineEventSuccess {
    timelineEvent {
      id
      isActive
    }
  }
`

const mutation = graphql`
  mutation ArchiveTimelineEventMutation($timelineEventId: ID!) {
    archiveTimelineEvent(timelineEventId: $timelineEventId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...ArchiveTimelineEventMutation_notification @relay(mask: false)
    }
  }
`

export const archiveTimelineEventNotificationUpdater: SharedUpdater<
  ArchiveTimelineEventMutation_notification
> = (payload, {store}) => {
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
  variables
) => {
  return commitMutation<TArchiveTimelineEventMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('archiveTimelineEvent')
      archiveTimelineEventNotificationUpdater(payload as any, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {timelineEventId} = variables
      handleRemoveTimelineEvent(timelineEventId, store)
    }
  })
}

export default ArchiveTimelineEventMutation
