/**
 * Updates a reflection's content for the retrospective meeting.
 *
 */
import {commitMutation, graphql} from 'react-relay'
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord'
import {LocalHandlers} from 'universal/types/relayMutations'
import {IUpdateReflectionContentOnMutationArguments} from 'universal/types/graphql'
import Atmosphere from 'universal/Atmosphere'

graphql`
  fragment UpdateReflectionContentMutation_team on UpdateReflectionContentPayload {
    meeting {
      id
    }
    reflection {
      id
      content
    }
  }
`

const mutation = graphql`
  mutation UpdateReflectionContentMutation($content: String!, $reflectionId: ID!) {
    updateReflectionContent(content: $content, reflectionId: $reflectionId) {
      error {
        message
      }
      ...UpdateReflectionContentMutation_team @relay(mask: false)
    }
  }
`

const UpdateReflectionContentMutation = (
  atmosphere: Atmosphere,
  variables: IUpdateReflectionContentOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {reflectionId, content} = variables
      const reflectionProxy = store.get(reflectionId)
      const nowISO = new Date().toJSON()
      const optimisticReflection = {
        content,
        updatedAt: nowISO
      }
      updateProxyRecord(reflectionProxy, optimisticReflection)
    }
  })
}

export default UpdateReflectionContentMutation
