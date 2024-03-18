import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpdateRetrospectiveTemplateMutation as TUpdateRetrospectiveTemplateMutation} from '../__generated__/UpdateRetrospectiveTemplateMutation.graphql'

graphql`
  fragment UpdateRetrospectiveTemplateMutation_meeting on UpdateRetrospectiveTemplateSuccess {
    meeting {
      id
    }
  }
`

const mutation = graphql`
  mutation UpdateRetrospectiveTemplateMutation($meetingId: ID!, $templateId: ID!) {
    updateRetrospectiveTemplate(meetingId: $meetingId, templateId: $templateId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateRetrospectiveTemplateMutation_meeting @relay(mask: false)
    }
  }
`

const UpdateRetrospectiveTemplateMutation: StandardMutation<
  TUpdateRetrospectiveTemplateMutation
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TUpdateRetrospectiveTemplateMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default UpdateRetrospectiveTemplateMutation
