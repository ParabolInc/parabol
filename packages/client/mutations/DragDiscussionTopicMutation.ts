import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {DragDiscussionTopicMutation_meeting$data} from '~/__generated__/DragDiscussionTopicMutation_meeting.graphql'
import {SharedUpdater, SimpleMutation} from '../types/relayMutations'
import {DISCUSS} from '../utils/constants'
import {DragDiscussionTopicMutation as IDragDiscussionTopicMutation} from '../__generated__/DragDiscussionTopicMutation.graphql'
import handleUpdateStageSort from './handlers/handleUpdateStageSort'

graphql`
  fragment DragDiscussionTopicMutation_meeting on DragDiscussionTopicPayload {
    stage {
      id
      sortOrder
    }
    meeting {
      id
    }
  }
`

const mutation = graphql`
  mutation DragDiscussionTopicMutation($meetingId: ID!, $stageId: ID!, $sortOrder: Float!) {
    dragDiscussionTopic(meetingId: $meetingId, stageId: $stageId, sortOrder: $sortOrder) {
      ...DragDiscussionTopicMutation_meeting @relay(mask: false)
    }
  }
`

export const dragDiscussionTopicMeetingUpdater: SharedUpdater<
  DragDiscussionTopicMutation_meeting$data
> = (payload, {store}) => {
  const meetingId = payload.getLinkedRecord('meeting').getValue('id')
  handleUpdateStageSort(store, meetingId, DISCUSS)
}

const DragDiscussionTopicMutation: SimpleMutation<IDragDiscussionTopicMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<IDragDiscussionTopicMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('dragDiscussionTopic')
      if (!payload) return
      dragDiscussionTopicMeetingUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {meetingId, stageId, sortOrder} = variables
      const stage = store.get(stageId)
      if (!stage) return
      stage.setValue(sortOrder, 'sortOrder')
      handleUpdateStageSort(store, meetingId, DISCUSS)
    }
  })
}

export default DragDiscussionTopicMutation
