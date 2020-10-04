import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {CompletedHandler, ErrorHandler, SharedUpdater} from '../types/relayMutations'
import handleRemoveReflectTemplatePrompt from './handlers/handleRemoveReflectTemplatePrompt'
import {IRemoveReflectTemplatePromptOnMutationArguments} from '../types/graphql'
import {RemoveReflectTemplatePromptMutation_team} from '../__generated__/RemoveReflectTemplatePromptMutation_team.graphql'
import {RemoveReflectTemplatePromptMutation as IRemoveReflectTemplatePromptMutation} from '../__generated__/RemoveReflectTemplatePromptMutation.graphql'
import getInProxy from '~/utils/relay/getInProxy'

graphql`
  fragment RemoveReflectTemplatePromptMutation_team on RemoveReflectTemplatePromptPayload {
    prompt {
      id
      teamId
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

export const removeReflectTemplatePromptTeamUpdater: SharedUpdater<RemoveReflectTemplatePromptMutation_team> = (
  payload,
  {store}
) => {
  const promptId = getInProxy(payload, 'prompt', 'id')
  const teamId = getInProxy(payload, 'prompt', 'teamId')
  handleRemoveReflectTemplatePrompt(promptId, teamId, store)
}

const RemoveReflectTemplatePromptMutation = (
  atmosphere: Atmosphere,
  variables: IRemoveReflectTemplatePromptOnMutationArguments,
  _context: {},
  onError: ErrorHandler,
  onCompleted: CompletedHandler
): Disposable => {
  return commitMutation<IRemoveReflectTemplatePromptMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('removeReflectTemplatePrompt')
      if (!payload) return
      removeReflectTemplatePromptTeamUpdater(payload as any, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {promptId} = variables
      const prompt = store.get(promptId)
      if (!prompt) return
      const teamId = prompt.getValue('teamId') as string
      if (!teamId) return
      handleRemoveReflectTemplatePrompt(promptId, teamId, store)
    }
  })
}

export default RemoveReflectTemplatePromptMutation
