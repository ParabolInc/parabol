// @flow
import type {CompletedHandler, ErrorHandler} from 'universal/types/relay'
import {commitMutation} from 'react-relay'
import handleUpdateStageSort from 'universal/mutations/handlers/handleUpdateStageSort'
import {DISCUSS} from 'universal/utils/constants'
import getInProxy from 'universal/utils/relay/getInProxy'

type Variables = {
  stageId: string,
  meetingId: string,
  sortOrder: number
}

graphql`
  fragment DragDiscussionTopicMutation_team on DragDiscussionTopicPayload {
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
      ...DragDiscussionTopicMutation_team @relay(mask: false)
    }
  }
`

type Context = {}

type UpdaterContext = {
  store: Object
}

export const dragDiscussionTopicTeamUpdater = (payload: Object, {store}: UpdaterContext) => {
  const meetingId = getInProxy(payload, 'meeting', 'id')
  handleUpdateStageSort(store, meetingId, DISCUSS)
}

const DragDiscussionTopicMutation = (
  atmosphere: Object,
  variables: Variables,
  context?: Context,
  onError?: ErrorHandler,
  onCompleted?: CompletedHandler
) => {
  commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('dragDiscussionTopic')
      if (!payload) return
      dragDiscussionTopicTeamUpdater(payload, {store})
    },
    optimisticUpdater: (store) => {
      const {meetingId, stageId, sortOrder} = variables
      const stage = store.get(stageId)
      stage.setValue(sortOrder, 'sortOrder')
      handleUpdateStageSort(store, meetingId, DISCUSS)
    }
  })
}

export default DragDiscussionTopicMutation
