/**
 * Updates a reflection's title for the retrospective meeting.
 *
 */
import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {
  UpdateReflectionGroupTitleMutation as TUpdateReflectionGroupTitleMutation,
  UpdateReflectionGroupTitleMutation$data
} from '../__generated__/UpdateReflectionGroupTitleMutation.graphql'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import updateProxyRecord from '../utils/relay/updateProxyRecord'

graphql`
  fragment UpdateReflectionGroupTitleMutation_meeting on UpdateReflectionGroupTitlePayload {
    reflectionGroup {
      id
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

export const updateReflectionGroupTitleMeetingUpdater: SharedUpdater<
  UpdateReflectionGroupTitleMutation$data
> = (payload, {store}) => {
  const reflectionGroup = payload.getLinkedRecord('reflectionGroup')
  if (!reflectionGroup) return

  const groupId = reflectionGroup.getValue('id') as string
  const newTitle = reflectionGroup.getValue('title')
  const groupRecord = store.get(groupId)
  if (groupRecord) {
    groupRecord.setValue(newTitle, 'title')
  }
}

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
      const reflectionGroupProxy = store.get(reflectionGroupId)!
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
