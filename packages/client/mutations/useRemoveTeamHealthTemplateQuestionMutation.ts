import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useRemoveTeamHealthTemplateQuestionMutation as TRemoveTeamHealthTemplateQuestionMutation} from '../__generated__/useRemoveTeamHealthTemplateQuestionMutation.graphql'

graphql`
  fragment useRemoveTeamHealthTemplateQuestionMutation_team on RemoveTeamHealthTemplateQuestionSuccess {
    template {
      id
      questions {
        id
      }
    }
  }
`

const mutation = graphql`
  mutation useRemoveTeamHealthTemplateQuestionMutation($templateId: ID!, $questionIds: [ID!]!) {
    removeTeamHealthTemplateQuestion(templateId: $templateId, questionIds: $questionIds) {
      ...useRemoveTeamHealthTemplateQuestionMutation_team @relay(mask: false)
    }
  }
`

const useRemoveTeamHealthTemplateQuestionMutation = () => {
  const [commit, submitting] = useMutation<TRemoveTeamHealthTemplateQuestionMutation>(mutation)
  const execute = (config: UseMutationConfig<TRemoveTeamHealthTemplateQuestionMutation>) => {
    const {templateId, questionIds} = config.variables
    return commit({
      optimisticUpdater: (store) => {
        const template = store.get(templateId)
        if (!template) return
        const removedIds = new Set(questionIds)
        const existing = template.getLinkedRecords('questions') ?? []
        template.setLinkedRecords(
          existing.filter((q) => !removedIds.has(q.getValue('id') as string)),
          'questions'
        )
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useRemoveTeamHealthTemplateQuestionMutation
