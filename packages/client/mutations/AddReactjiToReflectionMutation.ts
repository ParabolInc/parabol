import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {AddReactjiToReflectionMutation as TAddReactjiToReflectionMutation} from '../__generated__/AddReactjiToReflectionMutation.graphql'
import createProxyRecord from 'utils/relay/createProxyRecord'
import {IRetroReflection} from 'types/graphql'

graphql`
  fragment AddReactjiToReflectionMutation_meeting on AddReactjiToReflectionSuccess {
    reflection {
      reactjis {
        id
        isViewerReactji
        count
      }
    }
  }
`

const mutation = graphql`
  mutation AddReactjiToReflectionMutation(
    $reflectionId: ID!
    $reactji: String!
    $isRemove: Boolean
  ) {
    addReactjiToReflection(reflectionId: $reflectionId, reactji: $reactji, isRemove: $isRemove) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...AddReactjiToReflectionMutation_meeting @relay(mask: false)
    }
  }
`

const AddReactjiToReflectionMutation: StandardMutation<TAddReactjiToReflectionMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddReactjiToReflectionMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {reflectionId, reactji, isRemove} = variables
      const id = `${reflectionId}:${reactji}`
      const reflection = store.get<IRetroReflection>(reflectionId)
      if (!reflection) return
      const reactjis = reflection.getLinkedRecords('reactjis')
      const reactjiIdx = reactjis.findIndex((reactji) => reactji.getValue('id') === id)
      if (isRemove) {
        if (reactjiIdx === -1) return
        const reactji = reactjis[reactjiIdx]
        const count = reactji.getValue('count')
        if (count === 1) {
          const nextReactjis = [...reactjis.slice(0, reactjiIdx), ...reactjis.slice(reactjiIdx + 1)]
          reflection.setLinkedRecords(nextReactjis, 'reactjis')
        } else {
          reactji.setValue(count - 1, 'count')
          reactji.setValue(false, 'isViewerReactji')
        }
      } else {
        if (reactjiIdx === -1) {
          const optimisticReactji =
            store.get(id) ||
            createProxyRecord(store, 'Reactji', {
              id,
              count: 1,
              isViewerReactji: true
            })
          const nextReactjis = [...reactjis, optimisticReactji]
          reflection.setLinkedRecords(nextReactjis, 'reactjis')
        } else {
          const reactji = reactjis[reactjiIdx]
          const count = reactji.getValue('count')
          reactji.setValue(count + 1, 'count')
          reactji.setValue(true, 'isViewerReactji')
        }
      }
    },
    onCompleted,
    onError
  })
}

export default AddReactjiToReflectionMutation
