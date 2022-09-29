/**
 * Updates a reflection's title for the retrospective meeting.
 *
 */
import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import updateProxyRecord from '../utils/relay/updateProxyRecord'
import {UpdateReflectionGroupTitleMutation as TUpdateReflectionGroupTitleMutation} from '../__generated__/UpdateReflectionGroupTitleMutation.graphql'

graphql`
  fragment UpdateReflectionGroupTitleMutation_meeting on UpdateReflectionGroupTitlePayload {
    reflectionGroup {
      title
      titleIsUserDefined
    }
  }
`

const mutation = graphql`
  mutation UpdateReflectionGroupTitleMutation($title: String!, $reflectionGroupId: ID!) {
    updateReflectionGroupTitle(title: $title, reflectionGroupId: $reflectionGroupId) {
      ...UpdateReflectionGroupTitleMutation_meeting @relay(mask: false)
    }
  }
`

const UpdateReflectionGroupTitleMutation: StandardMutation<TUpdateReflectionGroupTitleMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  return commitMutation<TUpdateReflectionGroupTitleMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {reflectionGroupId, title} = variables
      const reflectionGroupProxy = store.get(reflectionGroupId)
      const nowISO = new Date().toJSON()
      const optimisticReflection = {
        title,
        updatedAt: nowISO
      }
      updateProxyRecord(reflectionGroupProxy, optimisticReflection)
    }
  })
}

export default UpdateReflectionGroupTitleMutation
