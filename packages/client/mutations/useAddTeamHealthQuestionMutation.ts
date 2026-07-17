import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useAddTeamHealthQuestionMutation as TAddTeamHealthQuestionMutation} from '../__generated__/useAddTeamHealthQuestionMutation.graphql'

graphql`
  fragment useAddTeamHealthQuestionMutation_question on AddTeamHealthQuestionSuccess {
    question {
      id
    }
    pack {
      id
      name
      userId
      questions {
        id
        ...TeamHealthQuestionRow_question
      }
    }
  }
`

const mutation = graphql`
  mutation useAddTeamHealthQuestionMutation($question: String!) {
    addTeamHealthQuestion(question: $question) {
      ...useAddTeamHealthQuestionMutation_question @relay(mask: false)
    }
  }
`

// The mutation response doesn't know which template is being edited, so the editing template is
// passed in separately to attach a newly-created personal pack to its availableQuestionPacks list.
const useAddTeamHealthQuestionMutation = (templateId: string) => {
  const [commit, submitting] = useMutation<TAddTeamHealthQuestionMutation>(mutation)
  const execute = (config: UseMutationConfig<TAddTeamHealthQuestionMutation>) => {
    return commit({
      updater: (store) => {
        const payload = store.getRootField('addTeamHealthQuestion')
        const pack = payload?.getLinkedRecord('pack')
        if (!pack) return
        const template = store.get(templateId)
        if (!template) return
        const packs = template.getLinkedRecords('availableQuestionPacks') ?? []
        const packId = pack.getValue('id')
        if (!packs.some((p) => p.getValue('id') === packId)) {
          // the viewer's personal pack is always shown first
          template.setLinkedRecords([pack, ...packs], 'availableQuestionPacks')
        }
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useAddTeamHealthQuestionMutation
