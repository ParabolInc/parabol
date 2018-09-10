import {commitMutation, graphql} from 'react-relay'
import Atmosphere from 'universal/Atmosphere'
import getInProxy from 'universal/utils/relay/getInProxy'
import {CompletedHandler, ErrorHandler, TeamUpdater} from '../types/relayMutations'
import handleRemoveReflectTemplate from './handlers/handleRemoveReflectTemplate'
import IRemoveReflectTemplateOnMutationArguments = GQL.IRemoveReflectTemplateOnMutationArguments

graphql`
  fragment RemoveReflectTemplateMutation_team on RemoveReflectTemplatePayload {
    reflectTemplate {
      id
    }
    retroMeetingSettings {
      selectedTemplateId
    }
  }
`

const mutation = graphql`
  mutation RemoveReflectTemplateMutation($templateId: ID!) {
    removeReflectTemplate(templateId: $templateId) {
      ...RemoveReflectTemplateMutation_team @relay(mask: false)
    }
  }
`

export const removeReflectTemplateTeamUpdater: TeamUpdater = (payload, {store}) => {
  const templateId = getInProxy(payload, 'reflectTemplate', 'id')
  handleRemoveReflectTemplate(templateId, store)
}

const RemoveReflectTemplateMutation = (
  atmosphere: Atmosphere,
  variables: IRemoveReflectTemplateOnMutationArguments,
  _context: {},
  onError: ErrorHandler,
  onCompleted: CompletedHandler
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('removeReflectTemplate')
      if (!payload) return
      removeReflectTemplateTeamUpdater(payload, {store})
    },
    optimisticUpdater: (store) => {
      const {templateId} = variables
      handleRemoveReflectTemplate(templateId, store)
    }
  })
}

export default RemoveReflectTemplateMutation
