import {ArchiveTimelineEventMutation_notification$data} from '__generated__/ArchiveTimelineEventMutation_notification.graphql'
import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {ConnectionHandler, RecordSourceSelectorProxy} from 'relay-runtime'
import safeRemoveNodeFromConn from '~/utils/relay/safeRemoveNodeFromConn'
import {ArchiveTimelineEventMutation as TArchiveTimelineEventMutation} from '../__generated__/ArchiveTimelineEventMutation.graphql'
import {SharedUpdater, SimpleMutation} from '../types/relayMutations'
import {parseQueryParams} from '../utils/useQueryParameterParser'
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
  ArchiveTimelineEventMutation_notification$data
> = (payload, {store}) => {
  const timelineEvent = payload.getLinkedRecord('timelineEvent')
  if (!timelineEvent) return
  const timelineEventId = timelineEvent.getValue('id')
  handleRemoveTimelineEvent(timelineEventId, store)
}

const handleRemoveTimelineEvent = (timelineEventId: string, store: RecordSourceSelectorProxy) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')!
  const {teamIds, eventTypes} = parseQueryParams(viewer.getDataID(), window.location)
  const activeTimelineEventsConn = getUserTimelineEventsConn(
    viewer,
    null,
    teamIds,
    eventTypes,
    false // showArchived
  )
  safeRemoveNodeFromConn(timelineEventId, activeTimelineEventsConn)

  const archivedTimelineEvent = store.get(timelineEventId)
  const archivedTimelineEventsConn = getUserTimelineEventsConn(
    viewer,
    null,
    teamIds,
    eventTypes,
    true
  )
  if (archivedTimelineEvent && archivedTimelineEventsConn) {
    ConnectionHandler.insertEdgeBefore(archivedTimelineEventsConn, archivedTimelineEvent)
  }
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
