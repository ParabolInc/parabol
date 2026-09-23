import {ConnectionHandler, type RecordSourceSelectorProxy} from 'relay-runtime'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import safeRemoveNodeFromConn from '../../utils/relay/safeRemoveNodeFromConn'
import getReflectTemplateOrgConn from '../connections/getReflectTemplateOrgConn'
import getReflectTemplatePublicConn from '../connections/getReflectTemplatePublicConn'
import pluralizeHandler from './pluralizeHandler'

const handleRemovePromptTemplate = (
  templateId: string,
  teamId: string,
  store: RecordSourceSelectorProxy<any>
) => {
  const team = store.get(teamId)!
  const retroSettings = team.getLinkedRecord('meetingSettings', {
    meetingType: 'retrospective'
  })
  safeRemoveNodeFromArray(templateId, retroSettings, 'teamTemplates')
  safeRemoveNodeFromConn(templateId, getReflectTemplateOrgConn(retroSettings))
  safeRemoveNodeFromConn(templateId, getReflectTemplatePublicConn(retroSettings))
  const standupSettings = team.getLinkedRecord('meetingSettings', {
    meetingType: 'teamPrompt'
  })
  safeRemoveNodeFromArray(templateId, standupSettings, 'teamTemplates')

  const viewer = store.getRoot().getLinkedRecord('viewer')
  const allAvailableConn =
    viewer && ConnectionHandler.getConnection(viewer, 'ActivityLibrary_availableTemplates')
  safeRemoveNodeFromConn(templateId, allAvailableConn)
  const allDetailsConn =
    viewer && ConnectionHandler.getConnection(viewer, 'ActivityDetails_availableTemplates')
  safeRemoveNodeFromConn(templateId, allDetailsConn)
}

const handleRemovePromptTemplates = pluralizeHandler(handleRemovePromptTemplate)
export default handleRemovePromptTemplates
