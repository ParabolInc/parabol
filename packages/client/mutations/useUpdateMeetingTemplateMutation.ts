import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpdateMeetingTemplateMutation as TUpdateMeetingTemplateMutation} from '../__generated__/useUpdateMeetingTemplateMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import GraphQLServerError from '../utils/relay/GraphQLServerError'

graphql`
  fragment useUpdateMeetingTemplateMutation_meeting on UpdateMeetingTemplateSuccess {
    meeting {
      ... on RetrospectiveMeeting {
        id
        templateId
        meetingSeries {
          id
          templateId
        }
        phases {
          id
          ... on ReflectPhase {
            reflectPrompts {
              ...PhaseItemColumn_prompt @relay(mask: false)
              ...GroupingKanbanColumn_prompt @relay(mask: false)
              id
              sortOrder
            }
          }
        }
      }
      ... on TeamPromptMeeting {
        id
        meetingSeries {
          id
          templateId
        }
        ...TeamPromptStructuredMeeting_meeting
      }
    }
  }
`

const mutation = graphql`
  mutation useUpdateMeetingTemplateMutation(
    $meetingId: ID!
    $templateId: ID!
    $applyToSeries: Boolean
    $clearTeamPromptResponses: Boolean
  ) {
    updateMeetingTemplate(
      meetingId: $meetingId
      templateId: $templateId
      applyToSeries: $applyToSeries
      clearTeamPromptResponses: $clearTeamPromptResponses
    ) {
      ...useUpdateMeetingTemplateMutation_meeting @relay(mask: false)
    }
  }
`

const useUpdateMeetingTemplateMutation = () => {
  const [commit, submitting] = useMutation<TUpdateMeetingTemplateMutation>(mutation)
  const atmosphere = useAtmosphere()
  const reportError = (message: string) => {
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: 'updateMeetingTemplateError',
      message,
      autoDismiss: 5
    })
  }
  const execute = (config: UseMutationConfig<TUpdateMeetingTemplateMutation>) => {
    return commit({
      onCompleted: (_res, errors) => {
        const message = errors?.[0]?.message
        if (message) reportError(message)
      },
      onError: (error) => {
        reportError(
          error instanceof GraphQLServerError ? error.message : 'Could not change the template'
        )
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useUpdateMeetingTemplateMutation
