import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useAddTeamHealthQuestionMutation as TAddTeamHealthQuestionMutation} from '../__generated__/useAddTeamHealthQuestionMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import createProxyRecord from '../utils/relay/createProxyRecord'
import useAddTeamHealthTemplateQuestionMutation from './useAddTeamHealthTemplateQuestionMutation'

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
// passed in separately to attach a newly-created personal pack to its availableQuestionPacks list
// and to select the new question on that template once it has a server id.
const useAddTeamHealthQuestionMutation = (templateId: string) => {
  const atmosphere = useAtmosphere()
  const [commit, submitting] = useMutation<TAddTeamHealthQuestionMutation>(mutation)
  const [selectQuestion] = useAddTeamHealthTemplateQuestionMutation()
  const execute = (config: UseMutationConfig<TAddTeamHealthQuestionMutation>) => {
    const {viewerId} = atmosphere
    const {question} = config.variables
    const {onCompleted, onError} = config
    return commit({
      // the server picks the category with AI, which is slow. Show the question right away, already
      // selected, with a temp-id placeholder category that the tag renders as a loading ellipsis
      optimisticUpdater: (store) => {
        const template = store.get(templateId)
        if (!template) return
        const packs = template.getLinkedRecords('availableQuestionPacks') ?? []
        const existingPack = packs.find((p) => p.getValue('userId') === viewerId)
        const pack =
          existingPack ??
          createProxyRecord(store, 'TeamHealthQuestionPack', {
            name: 'My Questions',
            userId: viewerId,
            source: null,
            sourceUrl: null
          })
        if (!existingPack) {
          pack.setLinkedRecords([], 'questions')
          template.setLinkedRecords([pack, ...packs], 'availableQuestionPacks')
        }
        const category = createProxyRecord(store, 'TeamHealthCategory', {
          name: '',
          createdAt: new Date().toJSON()
        })
        const newQuestion = createProxyRecord(store, 'TeamHealthQuestion', {
          question,
          createdBy: viewerId
        })
        newQuestion.setLinkedRecord(category, 'category')
        const questions = pack.getLinkedRecords('questions') ?? []
        pack.setLinkedRecords([...questions, newQuestion], 'questions')
        const selected = template.getLinkedRecords('questions') ?? []
        template.setLinkedRecords([...selected, newQuestion], 'questions')
      },
      updater: (store) => {
        const payload = store.getRootField('addTeamHealthQuestion')
        const pack = payload?.getLinkedRecord('pack')
        const question = payload?.getLinkedRecord('question')
        if (!pack || !question) return
        const template = store.get(templateId)
        if (!template) return
        const packs = template.getLinkedRecords('availableQuestionPacks') ?? []
        const packId = pack.getValue('id')
        if (!packs.some((p) => p.getValue('id') === packId)) {
          // the viewer's personal pack is always shown first
          template.setLinkedRecords([pack, ...packs], 'availableQuestionPacks')
        }
        // keep the row checked while the follow-up selection mutation is in flight
        const selected = template.getLinkedRecords('questions') ?? []
        template.setLinkedRecords([...selected, question], 'questions')
      },
      ...config,
      onCompleted: (response, errors) => {
        const questionId = response.addTeamHealthQuestion.question.id
        selectQuestion({variables: {templateId, questionIds: [questionId]}, onError})
        onCompleted?.(response, errors)
      }
    })
  }
  return [execute, submitting] as const
}

export default useAddTeamHealthQuestionMutation
