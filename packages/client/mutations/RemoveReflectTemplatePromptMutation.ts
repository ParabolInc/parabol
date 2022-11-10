import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import {RemoveReflectTemplatePromptMutation as TRemoveReflectTemplatePromptMutation} from '../__generated__/RemoveReflectTemplatePromptMutation.graphql'
import {RemoveReflectTemplatePromptMutation_team} from '../__generated__/RemoveReflectTemplatePromptMutation_team.graphql'
import handleRemoveReflectTemplatePrompt from './handlers/handleRemoveReflectTemplatePrompt'

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

export const removeReflectTemplatePromptTeamUpdater: SharedUpdater<
  RemoveReflectTemplatePromptMutation_team
> = (payload, {store}) => {
  const promptId = payload.getLinkedRecord('prompt').getValue('id')
  const teamId = payload.getLinkedRecord('prompt').getValue('teamId')
  handleRemoveReflectTemplatePrompt(promptId, teamId, store)
}

const RemoveReflectTemplatePromptMutation: StandardMutation<
  TRemoveReflectTemplatePromptMutation
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TRemoveReflectTemplatePromptMutation>(atmosphere, {
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
