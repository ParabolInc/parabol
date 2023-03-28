import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import createProxyRecord from '~/utils/relay/createProxyRecord'
import {StandardMutation} from '../types/relayMutations'
import {AddReactjiToReactableMutation as TAddReactjiToReactableMutation} from '../__generated__/AddReactjiToReactableMutation.graphql'

graphql`
  fragment AddReactjiToReactableMutation_meeting on AddReactjiToReactableSuccess {
    reactable {
      reactjis {
        id
        isViewerReactji
        count
        ...ReactjiCount_reactji
      }
    }
  }
`

const mutation = graphql`
  mutation AddReactjiToReactableMutation(
    $reactableId: ID!
    $reactableType: ReactableEnum!
    $reactji: String!
    $isRemove: Boolean
    $meetingId: ID!
  ) {
    addReactjiToReactable(
      reactableId: $reactableId
      reactableType: $reactableType
      reactji: $reactji
      isRemove: $isRemove
      meetingId: $meetingId
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...AddReactjiToReactableMutation_meeting @relay(mask: false)
    }
  }
`

type Reactable = NonNullable<
  TAddReactjiToReactableMutation['response']['addReactjiToReactable']['reactable']
>

const AddReactjiToReactableMutation: StandardMutation<TAddReactjiToReactableMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddReactjiToReactableMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const viewer = store.get(atmosphere.viewerId)!
      const {reactableId, reactji, isRemove} = variables
      const id = `${reactableId}:${reactji}`
      const reactable = store.get<Reactable>(reactableId)
      if (!reactable) return
      const reactjis = reactable.getLinkedRecords('reactjis')
      const reactjiIdx = reactjis.findIndex((reactji) => reactji.getValue('id') === id)
      if (isRemove) {
        if (reactjiIdx === -1) return
        const reactji = reactjis[reactjiIdx]!
        const count = reactji.getValue('count')
        if (count === 1) {
          const nextReactjis = [...reactjis.slice(0, reactjiIdx), ...reactjis.slice(reactjiIdx + 1)]
          reactable.setLinkedRecords(nextReactjis, 'reactjis')
        } else {
          reactji.setValue(count - 1, 'count')
          reactji.setValue(false, 'isViewerReactji')

          const existingReactjiUsers = reactji.getLinkedRecords('users')
          if (!existingReactjiUsers) return
          const updatedReactjiUsers = existingReactjiUsers.filter(
            (existingReactjiUser) => existingReactjiUser.getValue('id') !== atmosphere.viewerId
          )
          reactji.setLinkedRecords(updatedReactjiUsers, 'users')
        }
      } else {
        if (reactjiIdx === -1) {
          const optimisticReactji =
            store.get(id) ||
            createProxyRecord(store, 'Reactji', {
              id,
              count: 1,
              isViewerReactji: true
            }).setLinkedRecords([viewer], 'users')
          const nextReactjis = [...reactjis, optimisticReactji]
          reactable.setLinkedRecords(nextReactjis, 'reactjis')
        } else {
          const reactji = reactjis[reactjiIdx]!
          const count = reactji.getValue('count')
          reactji.setValue(count + 1, 'count')
          reactji.setValue(true, 'isViewerReactji')

          const existingReactjiUsers = reactji.getLinkedRecords('users')
          if (!existingReactjiUsers) return
          const updatedReactjiUsers = [...existingReactjiUsers, viewer]
          reactji.setLinkedRecords(updatedReactjiUsers, 'users')
        }
      }
    },
    onCompleted,
    onError
  })
}

export default AddReactjiToReactableMutation
