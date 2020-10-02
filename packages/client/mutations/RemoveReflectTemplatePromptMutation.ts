import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import getInProxy from '../utils/relay/getInProxy'
import {CompletedHandler, ErrorHandler, SharedUpdater} from '../types/relayMutations'
import handleRemoveReflectTemplatePrompt from './handlers/handleRemoveReflectTemplatePrompt'
import {IReflectPrompt, IRemoveReflectTemplatePromptOnMutationArguments} from '../types/graphql'
import {RemoveReflectTemplatePromptMutation_team} from '../__generated__/RemoveReflectTemplatePromptMutation_team.graphql'
import {RemoveReflectTemplatePromptMutation as IRemoveReflectTemplatePromptMutation} from '../__generated__/RemoveReflectTemplatePromptMutation.graphql'

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
  const promptId = payload.getLinkedRecord('prompt').getValue('id') // getInProxy(payload, 'prompt', 'id')
  const teamId = payload.getLinkedRecord('prompt').getValue('teamId') as string
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
    }
  })
}

export default RemoveReflectTemplatePromptMutation
