import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useEditTeamHealthQuestionMutation as TEditTeamHealthQuestionMutation} from '../__generated__/useEditTeamHealthQuestionMutation.graphql'

const mutation = graphql`
  mutation useEditTeamHealthQuestionMutation($questionId: ID!, $question: String!) {
    editTeamHealthQuestion(questionId: $questionId, question: $question) {
      question {
        id
        ...TeamHealthQuestionRow_question
      }
      replacedQuestionId
    }
  }
`

// When a question is edited after being answered the server creates a new version and hides the
// original, so the old question id must be swapped for the new one wherever the template references it.
// The in-place edit case needs no updater — Relay merges the new text by id.
const useEditTeamHealthQuestionMutation = (templateId: string) => {
  const [commit, submitting] = useMutation<TEditTeamHealthQuestionMutation>(mutation)
  const execute = (config: UseMutationConfig<TEditTeamHealthQuestionMutation>) => {
    return commit({
      updater: (store) => {
        const payload = store.getRootField('editTeamHealthQuestion')
        const newQuestion = payload?.getLinkedRecord('question')
        const replacedId = payload?.getValue('replacedQuestionId') as string | null | undefined
        if (!newQuestion || !replacedId) return
        const newId = newQuestion.getValue('id')
        if (replacedId === newId) return
        const template = store.get(templateId)
        if (!template) return
        const swap = <T extends {getValue: (k: string) => unknown}>(records: readonly T[]) =>
          records.map((record) =>
            record.getValue('id') === replacedId ? (newQuestion as unknown as T) : record
          )
        const templateQuestions = template.getLinkedRecords('questions')
        if (templateQuestions) {
          template.setLinkedRecords(swap(templateQuestions), 'questions')
        }
        const packs = template.getLinkedRecords('availableQuestionPacks') ?? []
        packs.forEach((pack) => {
          const packQuestions = pack.getLinkedRecords('questions')
          if (packQuestions?.some((q) => q.getValue('id') === replacedId)) {
            pack.setLinkedRecords(swap(packQuestions), 'questions')
          }
        })
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useEditTeamHealthQuestionMutation
