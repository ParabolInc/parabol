import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {LocalHandlers, StandardMutation} from '../types/relayMutations'
import {CreatePollMutation as TCreatePollMutation} from '../__generated__/CreatePollMutation.graphql'
import {Poll_poll} from '~/__generated__/Poll_poll.graphql'

graphql`
  fragment CreatePollMutation_poll on CreatePollSuccess {
    poll {
      id
      title
      createdBy
      createdByUser {
        id
        preferredName
        picture
      }
      threadSortOrder
      options {
        id
        title
        placeholder
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
      ...CreatePollMutation_poll @relay(mask: false)
    }
  }
`

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
