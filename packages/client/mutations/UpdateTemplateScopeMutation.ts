import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {MeetingTypeEnum} from '../types/graphql'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import addNodeToArray from '../utils/relay/addNodeToArray'
import getBaseRecord from '../utils/relay/getBaseRecord'
import getNodeById from '../utils/relay/getNodeById'
import {insertEdgeAfter} from '../utils/relay/insertEdge'
import safeRemoveNodeFromArray from '../utils/relay/safeRemoveNodeFromArray'
import safeRemoveNodeFromConn from '../utils/relay/safeRemoveNodeFromConn'
import {UpdateTemplateScopeMutation as TUpdateTemplateScopeMutation} from '../__generated__/UpdateTemplateScopeMutation.graphql'
import {SharingScopeEnum, UpdateTemplateScopeMutation_team} from '../__generated__/UpdateTemplateScopeMutation_team.graphql'
import getReflectTemplateOrgConn from './connections/getReflectTemplateOrgConn'

graphql`
  fragment UpdateTemplateScopeMutation_team on UpdateTemplateScopeSuccess {
    template {
      id
      scope
      teamId
    }
  }
`

const mutation = graphql`
  mutation UpdateTemplateScopeMutation($templateId: ID!, $scope: SharingScopeEnum!) {
    updateTemplateScope(templateId: $templateId, scope: $scope) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateTemplateScopeMutation_team @relay(mask: false)
    }
  }
`

const removeTemplateFromCurrentScope = (templateId: string, currentScope: SharingScopeEnum, meetingSettings: RecordProxy) => {
  if (currentScope === 'TEAM') {
    safeRemoveNodeFromArray(templateId, meetingSettings, 'teamTemplates')
  } else if (currentScope === 'ORGANIZATION') {
    const orgTemplatesConn = getReflectTemplateOrgConn(meetingSettings)
    safeRemoveNodeFromConn(templateId, orgTemplatesConn)
  } else if (currentScope === 'PUBLIC') {
    const publicTemplatesConn = getReflectTemplateOrgConn(meetingSettings)
    safeRemoveNodeFromConn(templateId, publicTemplatesConn)
  }
}

const putTemplateInConnection = (template: RecordProxy, connection: RecordProxy | null | undefined, store: RecordSourceSelectorProxy) => {
  const templateId = template.getValue('id')
  if (connection && !getNodeById(templateId as string, connection)) {
    const newEdge = ConnectionHandler.createEdge(store, connection, template, 'ReflectTemplateEdge')
    newEdge.setValue(templateId, 'cursor')
    insertEdgeAfter(connection, newEdge)
  }
}

const addTemplateToScope = (template: RecordProxy, scope: SharingScopeEnum, meetingSettings: RecordProxy, store: RecordSourceSelectorProxy) => {
  if (scope === 'TEAM') {
    addNodeToArray(template, meetingSettings, 'teamTemplates')
  } else if (scope === 'ORGANIZATION') {
    const orgTemplatesConn = getReflectTemplateOrgConn(meetingSettings)
    putTemplateInConnection(template, orgTemplatesConn, store)
  } else if (scope === 'PUBLIC') {
    const publicTemplatesConn = getReflectTemplateOrgConn(meetingSettings)
    putTemplateInConnection(template, publicTemplatesConn, store)
  }
}

const handleUpdateTemplateScope = (template: RecordProxy, newScope: SharingScopeEnum, store: RecordSourceSelectorProxy) => {
  const templateId = template.getValue('id') as string
  const teamId = template.getValue('teamId') as string
  const team = store.get(teamId)
  if (!team) return
  const meetingSettings = team.getLinkedRecord('meetingSettings', {meetingType: MeetingTypeEnum.retrospective})
  if (!meetingSettings) return

  const oldTemplate = getBaseRecord(store, templateId)
  const oldScope = oldTemplate.getValue('scope')

  removeTemplateFromCurrentScope(templateId, oldScope, meetingSettings)
  addTemplateToScope(template, newScope, meetingSettings, store)
}

const updateTemplateScopeTeamUpdater: SharedUpdater<UpdateTemplateScopeMutation_team> = (payload: any, {store}) => {
  const template = payload.getLinkedRecord('template')
  if (!template) return
  const newScope = template.getValue('scope')
  handleUpdateTemplateScope(template, newScope, store)
}

const UpdateTemplateScopeMutation: StandardMutation<TUpdateTemplateScopeMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateTemplateScopeMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('updateTemplateScope')
      if (!payload) return
      updateTemplateScopeTeamUpdater(payload as any, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {scope, templateId} = variables
      const template = store.get(templateId)
      if (!template) return
      handleUpdateTemplateScope(template, scope, store)
    },
    onCompleted,
    onError
  })
}

export default UpdateTemplateScopeMutation
