/**
 * Updates a reflection's title for the retrospective meeting.
 *
 */
import {commitMutation, graphql} from 'react-relay'
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord'
import {IUpdateReflectionGroupTitleOnMutationArguments} from 'universal/types/graphql'
import Atmosphere from 'universal/Atmosphere'
import {LocalHandlers} from 'universal/types/relayMutations'

graphql`
  fragment UpdateReflectionGroupTitleMutation_team on UpdateReflectionGroupTitlePayload {
    reflectionGroup {
      title
    }
  }
`

const mutation = graphql`
  mutation UpdateReflectionGroupTitleMutation($title: String!, $reflectionGroupId: ID!) {
    updateReflectionGroupTitle(title: $title, reflectionGroupId: $reflectionGroupId) {
      ...UpdateReflectionGroupTitleMutation_team @relay(mask: false)
    }
  }
`

const UpdateReflectionGroupTitleMutation = (
  atmosphere: Atmosphere,
  variables: IUpdateReflectionGroupTitleOnMutationArguments,
  {onCompleted, onError}: LocalHandlers
) => {
  return commitMutation(atmosphere, {
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
