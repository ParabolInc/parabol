import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {LocalHandlers, SharedUpdater, StandardMutation} from '../types/relayMutations'
import {CreatePollMutation as TCreatePollMutation} from '../__generated__/CreatePollMutation.graphql'
import {CreatePollMutation_meeting} from '~/__generated__/CreatePollMutation_meeting.graphql'
import {Poll_poll} from '~/__generated__/Poll_poll.graphql'
import getDiscussionThreadConn from './connections/getDiscussionThreadConn'
import safePutNodeInConn from './handlers/safePutNodeInConn'

graphql`
  fragment CreatePollMutation_meeting on CreatePollSuccess {
    meetingId
    poll {
      ...ThreadedItem_threadable
      discussionId
      threadSortOrder
      id
      options {
        id
        title
      }
    }
  }
`

const mutation = graphql`
  mutation CreatePollMutation($newPoll: CreatePollInput!) {
    createPoll(newPoll: $newPoll) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...CreatePollMutation_meeting @relay(mask: false)
    }
  }
`

export const createPollMeetingUpdater: SharedUpdater<CreatePollMutation_meeting> = (
  payload,
  {store}
) => {
  const poll = payload.getLinkedRecord('poll')
  if (!poll) {
    console.warn('No poll object found, skipping!')
    return
  }
  const discussionId = poll.getValue('discussionId')
  if (discussionId) {
    const threadConn = getDiscussionThreadConn(store, discussionId)
    safePutNodeInConn(threadConn, poll, store, 'threadSortOrder', true)
  }
}

interface Handlers extends LocalHandlers {
  localPoll: Poll_poll
}

const CreatePollMutation: StandardMutation<TCreatePollMutation, Handlers> = (
  atmosphere,
  variables,
  {localPoll, onError, onCompleted}
) => {
  return commitMutation<TCreatePollMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('createPoll')
      if (!payload) {
        console.warn('No poll object created')
        return
      }
      const newlyCreatedPoll = payload.getLinkedRecord('poll')
      const existingPoll = store.get(localPoll.id)
      if (!existingPoll) {
        console.warn(`Could not find poll with id: ${localPoll.id}, skipping update!`)
        return
      }
      const newlyCreatedPollId = newlyCreatedPoll.getValue('id')
      existingPoll.setValue(newlyCreatedPollId, 'id')

      const newPollOptions = existingPoll.getLinkedRecords('options')
      if (!newPollOptions) {
        console.warn(`Could not find poll options for poll id: ${localPoll.id}, skipping update!`)
        return
      }
      existingPoll.setLinkedRecords(newPollOptions, 'options')
    },
    onCompleted,
    onError
  })
}

export default CreatePollMutation
