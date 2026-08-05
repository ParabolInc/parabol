import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useDeleteTeamHealthQuestionMutation as TDeleteTeamHealthQuestionMutation} from '../__generated__/useDeleteTeamHealthQuestionMutation.graphql'

const mutation = graphql`
  mutation useDeleteTeamHealthQuestionMutation($questionId: ID!) {
    deleteTeamHealthQuestion(questionId: $questionId) {
      questionId
    }
  }
`

// The mutation only knows the questionId, so the editing template is passed in separately to drop the
// deleted question from that template's selected questions and from every available pack's question list.
const useDeleteTeamHealthQuestionMutation = (templateId: string) => {
  const [commit, submitting] = useMutation<TDeleteTeamHealthQuestionMutation>(mutation)
  const execute = (config: UseMutationConfig<TDeleteTeamHealthQuestionMutation>) => {
    const {questionId} = config.variables
    const updater = (store: Parameters<NonNullable<typeof config.updater>>[0]) => {
      const template = store.get(templateId)
      if (!template) return
      const without = <T extends {getValue: (k: string) => unknown}>(records: readonly T[]) =>
        records.filter((record) => record.getValue('id') !== questionId)
      const templateQuestions = template.getLinkedRecords('questions')
      if (templateQuestions) {
        template.setLinkedRecords(without(templateQuestions), 'questions')
      }
      const packs = template.getLinkedRecords('availableQuestionPacks') ?? []
      packs.forEach((pack) => {
        const packQuestions = pack.getLinkedRecords('questions')
        if (packQuestions?.some((q) => q.getValue('id') === questionId)) {
          pack.setLinkedRecords(without(packQuestions), 'questions')
        }
      })
    }
    return commit({
      optimisticUpdater: updater,
      updater,
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useDeleteTeamHealthQuestionMutation
