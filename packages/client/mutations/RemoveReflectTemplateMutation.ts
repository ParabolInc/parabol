import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import getInProxy from '../utils/relay/getInProxy'
import {CompletedHandler, ErrorHandler, SharedUpdater} from '../types/relayMutations'
import handleRemoveReflectTemplate from './handlers/handleRemoveReflectTemplate'
import {IRemoveReflectTemplateOnMutationArguments} from '../types/graphql'
import {RemoveReflectTemplateMutation_team} from '../__generated__/RemoveReflectTemplateMutation_team.graphql'

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

export const removeReflectTemplateTeamUpdater: SharedUpdater<RemoveReflectTemplateMutation_team> = (
  payload,
  {store}
) => {
  const templateId = getInProxy(payload, 'reflectTemplate', 'id')
  handleRemoveReflectTemplate(templateId, store)
}

const RemoveReflectTemplateMutation = (
  atmosphere: Atmosphere,
  variables: IRemoveReflectTemplateOnMutationArguments,
  _context: {},
  onError: ErrorHandler,
  onCompleted: CompletedHandler
): Disposable => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('removeReflectTemplate')
      if (!payload) return
      removeReflectTemplateTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {templateId} = variables
      handleRemoveReflectTemplate(templateId, store)
    }
  })
}

export default RemoveReflectTemplateMutation
