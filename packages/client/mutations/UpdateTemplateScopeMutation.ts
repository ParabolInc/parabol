import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {ConnectionHandler, type RecordProxy, type RecordSourceSelectorProxy} from 'relay-runtime'
import type {UpdateTemplateScopeMutation as TUpdateTemplateScopeMutation} from '../__generated__/UpdateTemplateScopeMutation.graphql'
import type {
  SharingScopeEnum,
  UpdateTemplateScopeMutation_organization$data
} from '../__generated__/UpdateTemplateScopeMutation_organization.graphql'
import type Atmosphere from '../Atmosphere'
import type {SharedUpdater, StandardMutation} from '../types/relayMutations'
import addNodeToArray from '../utils/relay/addNodeToArray'
import getBaseRecord from '../utils/relay/getBaseRecord'
import getCachedRecord from '../utils/relay/getCachedRecord'
import getNodeById from '../utils/relay/getNodeById'
import {insertEdgeAfter} from '../utils/relay/insertEdge'
import safeRemoveNodeFromArray from '../utils/relay/safeRemoveNodeFromArray'
import safeRemoveNodeFromConn from '../utils/relay/safeRemoveNodeFromConn'
import getReflectTemplateOrgConn from './connections/getReflectTemplateOrgConn'

graphql`
  fragment UpdateTemplateScopeMutation_organization on UpdateTemplateScopeSuccess {
    template {
      # these fragments are needed for listening org members
      ...TemplateSharing_template
      id
      orgId
      scope
      teamId
      type
    }
    clonedTemplate {
      ...TemplateSharing_template
      ...ActivityLibrary_template @relay(mask: false)
      orgId
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
      ...UpdateTemplateScopeMutation_organization @relay(mask: false) @alias
    }
  }
`

const removeTemplateFromCurrentScope = (
  templateId: string,
  scopeList: SharingScopeEnum,
  meetingSettings: RecordProxy
) => {
  if (scopeList === 'TEAM') {
    safeRemoveNodeFromArray(templateId, meetingSettings, 'teamTemplates')
  } else if (scopeList === 'ORGANIZATION') {
    const orgTemplatesConn = getReflectTemplateOrgConn(meetingSettings)
    safeRemoveNodeFromConn(templateId, orgTemplatesConn)
  }
  // not possible for the public list to get mutated because this is an org subscription
}

export const putTemplateInConnection = (
  template: RecordProxy,
  connection: RecordProxy | null | undefined,
  store: RecordSourceSelectorProxy
) => {
  const templateId = template.getValue('id')
  if (connection && !getNodeById(templateId as string, connection)) {
    const newEdge = ConnectionHandler.createEdge(store, connection, template, 'ReflectTemplateEdge')
    newEdge.setValue(templateId, 'cursor')
    insertEdgeAfter(connection, newEdge)
  }
}

const addTemplateToScope = (
  template: RecordProxy,
  scope: SharingScopeEnum,
  meetingSettings: RecordProxy,
  store: RecordSourceSelectorProxy
) => {
  if (scope === 'TEAM') {
    addNodeToArray(template, meetingSettings, 'teamTemplates')
  } else if (scope === 'ORGANIZATION') {
    const orgTemplatesConn = getReflectTemplateOrgConn(meetingSettings)
    putTemplateInConnection(template, orgTemplatesConn, store)
  }
}

const isTemplateAvailableToViewer = (template: RecordProxy, atmosphere: Atmosphere) => {
  if (template.getValue('scope') !== 'TEAM') return true
  const teamId = template.getValue('teamId') as string | undefined
  if (!teamId) return false
  return !!atmosphere.authObj?.tms.includes(teamId)
}

const swapTemplateInViewerConnections = (
  templateId: string,
  clonedTemplate: RecordProxy,
  store: RecordSourceSelectorProxy,
  atmosphere: Atmosphere
) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer) return
  const isAvailable = isTemplateAvailableToViewer(clonedTemplate, atmosphere)
  const connections = [
    ConnectionHandler.getConnection(viewer, 'ActivityLibrary_availableTemplates'),
    ConnectionHandler.getConnection(viewer, 'ActivityDetails_availableTemplates')
  ]
  connections.forEach((connection) => {
    if (!connection) return
    safeRemoveNodeFromConn(templateId, connection)
    if (isAvailable) putTemplateInConnection(clonedTemplate, connection, store)
  })
}

const SCOPES = ['TEAM', 'ORGANIZATION', 'PUBLIC']
const handleUpdateTemplateScope = (
  template: RecordProxy,
  newScope: SharingScopeEnum,
  store: RecordSourceSelectorProxy,
  atmosphere: Atmosphere,
  clonedTemplate?: RecordProxy
) => {
  const templateType = template.getValue('type')
  if (templateType === 'teamPrompt') {
    if (clonedTemplate) {
      swapTemplateInViewerConnections(
        template.getValue('id') as string,
        clonedTemplate,
        store,
        atmosphere
      )
    }
    return
  }
  if (templateType !== 'retrospective') return
  const templateId = template.getValue('id') as string
  const nextTemplate = clonedTemplate || template
  const templateTeamId = nextTemplate.getValue('teamId')
  const nextTemplateOrgId = nextTemplate.getValue('orgId')
  const oldTemplate = getBaseRecord(store, templateId)
  // default to TEAM in case the template belongs to another TEAM & therefore didn't exist before this upscope
  const oldScope = oldTemplate?.scope ?? 'TEAM'
  const isDecreasing = SCOPES.indexOf(oldScope) > SCOPES.indexOf(newScope)
  const filterFn = (obj: any) => obj && obj.__typename === 'Team' && obj.orgId === nextTemplateOrgId
  const teamRecords = getCachedRecord(store, filterFn, {isPlural: true})
  const teamIds = teamRecords.map(({id}) => id)
  teamIds.forEach((teamId) => {
    const team = store.get(teamId)
    if (!team) return
    const meetingSettings = team.getLinkedRecord('meetingSettings', {
      meetingType: 'retrospective'
    })
    if (!meetingSettings) return
    // this is on the ORG subscription, so this won't affect anything on a PUBLIC list because they're at least on the same org
    const scopeList = teamId === templateTeamId ? 'TEAM' : 'ORGANIZATION'
    if (scopeList === 'TEAM') {
      if (clonedTemplate) {
        removeTemplateFromCurrentScope(templateId, scopeList, meetingSettings)
        addTemplateToScope(nextTemplate, scopeList, meetingSettings, store)
      }
    } else if (scopeList === 'ORGANIZATION') {
      if (isDecreasing) {
        removeTemplateFromCurrentScope(templateId, scopeList, meetingSettings)
      } else {
        addTemplateToScope(nextTemplate, scopeList, meetingSettings, store)
      }
    }
  })
}

export const updateTemplateScopeOrganizationUpdater: SharedUpdater<
  UpdateTemplateScopeMutation_organization$data
> = (payload: any, {atmosphere, store}) => {
  const template = payload.getLinkedRecord('template')
  if (!template) return
  const clonedTemplate = payload.getLinkedRecord('clonedTemplate')
  const nextTemplate = clonedTemplate || template
  const newScope = nextTemplate.getValue('scope')
  handleUpdateTemplateScope(template, newScope, store, atmosphere, clonedTemplate)
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
      updateTemplateScopeOrganizationUpdater(payload as any, {
        atmosphere,
        store
      })
    },
    optimisticUpdater: (store) => {
      const {scope, templateId} = variables
      const template = store.get(templateId)
      if (!template) return
      template.setValue(scope, 'scope')
      handleUpdateTemplateScope(template, scope, store, atmosphere)
    },
    onCompleted,
    onError
  })
}

export default UpdateTemplateScopeMutation
