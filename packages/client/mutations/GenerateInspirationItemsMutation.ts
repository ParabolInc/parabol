import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {GenerateInspirationItemsMutation as TGenerateInspirationItemsMutation} from '../__generated__/GenerateInspirationItemsMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

const mutation = graphql`
  mutation GenerateInspirationItemsMutation($input: GenerateInspirationItemsInput!) {
    generateInspirationItems(input: $input) {
      meeting {
        id
      }
      inspirationItems {
        id
        content
        title
        service
        createdAt
      }
    }
  }
`

const GenerateInspirationItemsMutation: StandardMutation<TGenerateInspirationItemsMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TGenerateInspirationItemsMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      // Keep the cached `inspirationItems(service)` field in sync so re-opening the drawer
      // shows the latest generation without a refetch.
      const payload = store.getRootField('generateInspirationItems')
      if (!payload) return
      const items = payload.getLinkedRecords('inspirationItems')
      const meeting = payload.getLinkedRecord('meeting')
      if (!meeting || !items) return
      meeting.setLinkedRecords(items, 'inspirationItems', {service: variables.input.service})
    },
    onCompleted,
    onError
  })
}

export default GenerateInspirationItemsMutation
