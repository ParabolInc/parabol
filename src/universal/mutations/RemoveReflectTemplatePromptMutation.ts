import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import Atmosphere from 'universal/Atmosphere'
import getInProxy from 'universal/utils/relay/getInProxy'
import {CompletedHandler, ErrorHandler, TeamUpdater} from '../types/relayMutations'
import handleRemoveReflectTemplatePrompt from './handlers/handleRemoveReflectTemplatePrompt'
import {IRemoveReflectTemplatePromptOnMutationArguments} from 'universal/types/graphql'

graphql`
  fragment RemoveReflectTemplatePromptMutation_team on RemoveReflectTemplatePromptPayload {
    prompt {
      id
    }
  }
`

const mutation = graphql`
  mutation RemoveReflectTemplatePromptMutation($promptId: ID!) {
    removeReflectTemplatePrompt(promptId: $promptId) {
      ...RemoveReflectTemplatePromptMutation_team @relay(mask: false)
    }
  }
`

export const removeReflectTemplatePromptTeamUpdater: TeamUpdater = (payload, {store}) => {
  const promptId = getInProxy(payload, 'prompt', 'id')
  handleRemoveReflectTemplatePrompt(promptId, store)
}

const RemoveReflectTemplatePromptMutation = (
  atmosphere: Atmosphere,
  variables: IRemoveReflectTemplatePromptOnMutationArguments,
  _context: {},
  onError: ErrorHandler,
  onCompleted: CompletedHandler
): Disposable => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('removeReflectTemplatePrompt')
      if (!payload) return
      removeReflectTemplatePromptTeamUpdater(payload, {store})
    },
    optimisticUpdater: (store) => {
      const {promptId} = variables
      handleRemoveReflectTemplatePrompt(promptId, store)
    }
  })
}

export default RemoveReflectTemplatePromptMutation
