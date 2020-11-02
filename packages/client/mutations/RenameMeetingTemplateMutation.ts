import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {CompletedHandler, ErrorHandler} from '../types/relayMutations'
import {IRenameMeetingTemplateOnMutationArguments} from '../types/graphql'

graphql`
  fragment RenameMeetingTemplateMutation_meetingTemplate on RenameMeetingTemplatePayload {
    meetingTemplate {
      name
    }
  }
`

const mutation = graphql`
  mutation RenameMeetingTemplateMutation($templateId: ID!, $name: String!) {
    renameMeetingTemplate(templateId: $templateId, name: $name) {
      ...RenameMeetingTemplateMutation_meetingTemplate @relay(mask: false)
    }
  }
`

const RenameMeetingTemplateMutation = (
  atmosphere: Atmosphere,
  variables: IRenameMeetingTemplateOnMutationArguments,
  _context: {},
  onError: ErrorHandler,
  onCompleted: CompletedHandler
): Disposable => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {name, templateId} = variables
      const template = store.get(templateId)
      if (!template) return
      template.setValue(name, 'name')
    }
  })
}

export default RenameMeetingTemplateMutation
