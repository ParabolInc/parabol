import {commitMutation, graphql} from 'react-relay'
import Atmosphere from 'universal/Atmosphere'
import {CompletedHandler, ErrorHandler} from '../types/relayMutations'
import IRenameReflectTemplateOnMutationArguments = GQL.IRenameReflectTemplateOnMutationArguments

graphql`
  fragment RenameReflectTemplateMutation_team on RenameReflectTemplatePayload {
    reflectTemplate {
      name
    }
  }
`

const mutation = graphql`
  mutation RenameReflectTemplateMutation($templateId: ID!, $name: String!) {
    renameReflectTemplate(templateId: $templateId, name: $name) {
      ...RenameReflectTemplateMutation_team @relay(mask: false)
    }
  }
`

const RenameReflectTemplateMutation = (
  atmosphere: Atmosphere,
  variables: IRenameReflectTemplateOnMutationArguments,
  _context: {},
  onError: ErrorHandler,
  onCompleted: CompletedHandler
) => {
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

export default RenameReflectTemplateMutation
