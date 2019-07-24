import {commitMutation, graphql} from 'react-relay'
import handleUpdateStageSort from './handlers/handleUpdateStageSort'
import {DISCUSS} from '../utils/constants'
import getInProxy from '../utils/relay/getInProxy'
import {IDragDiscussionTopicOnMutationArguments} from '../types/graphql'
import Atmosphere from '../Atmosphere'
import {DragDiscussionTopicMutation as IDragDiscussionTopicMutation} from '../../__generated__/DragDiscussionTopicMutation.graphql'
import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'

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

export const dragDiscussionTopicTeamUpdater = (
  payload: RecordProxy,
  {store}: {store: RecordSourceSelectorProxy}
) => {
  const meetingId = getInProxy(payload, 'meeting', 'id')
  handleUpdateStageSort(store, meetingId, DISCUSS)
}

const DragDiscussionTopicMutation = (
  atmosphere: Atmosphere,
  variables: IDragDiscussionTopicOnMutationArguments
) => {
  commitMutation<IDragDiscussionTopicMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('dragDiscussionTopic')
      if (!payload) return
      dragDiscussionTopicTeamUpdater(payload, {store})
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
