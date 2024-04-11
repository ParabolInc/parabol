import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {UpdateMeetingTemplateMutation as TUpdateMeetingTemplateMutation} from '../__generated__/UpdateMeetingTemplateMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment UpdateMeetingTemplateMutation_meeting on UpdateMeetingTemplateSuccess {
    meeting {
      ... on RetrospectiveMeeting {
        id
        templateId
        phases {
          id
          ... on ReflectPhase {
            reflectPrompts {
              id
            }
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation UpdateMeetingTemplateMutation($meetingId: ID!, $templateId: ID!) {
    updateMeetingTemplate(meetingId: $meetingId, templateId: $templateId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateMeetingTemplateMutation_meeting @relay(mask: false)
    }
  }
`

const UpdateMeetingTemplateMutation: StandardMutation<TUpdateMeetingTemplateMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateMeetingTemplateMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default UpdateMeetingTemplateMutation
