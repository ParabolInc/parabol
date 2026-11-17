import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useAddTeamHealthTemplateQuestionMutation as TAddTeamHealthTemplateQuestionMutation} from '../__generated__/useAddTeamHealthTemplateQuestionMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

graphql`
  fragment useAddTeamHealthTemplateQuestionMutation_team on AddTeamHealthTemplateQuestionSuccess {
    template {
      id
      questions {
        id
      }
      ...TeamHealthMeetingPreview_template
    }
  }
`

const mutation = graphql`
  mutation useAddTeamHealthTemplateQuestionMutation($templateId: ID!, $questionIds: [ID!]!) {
    addTeamHealthTemplateQuestion(templateId: $templateId, questionIds: $questionIds) {
      ...useAddTeamHealthTemplateQuestionMutation_team @relay(mask: false)
    }
  }
`

const useAddTeamHealthTemplateQuestionMutation = () => {
  const [commit, submitting] = useMutation<TAddTeamHealthTemplateQuestionMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TAddTeamHealthTemplateQuestionMutation>) => {
    const {templateId, questionIds} = config.variables
    return commit({
      optimisticUpdater: (store) => {
        const template = store.get(templateId)
        if (!template) return
        const existing = template.getLinkedRecords('questions') ?? []
        const existingIds = new Set(existing.map((q) => q.getValue('id')))
        const added = questionIds
          .filter((id) => !existingIds.has(id))
          .map((id) => store.get(id))
          .filter((record): record is NonNullable<typeof record> => !!record)
        template.setLinkedRecords([...existing, ...added], 'questions')
      },
      onError: snackOnError(atmosphere),
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useAddTeamHealthTemplateQuestionMutation
