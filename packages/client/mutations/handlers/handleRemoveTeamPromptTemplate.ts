import {ConnectionHandler, type RecordSourceSelectorProxy} from 'relay-runtime'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import safeRemoveNodeFromConn from '../../utils/relay/safeRemoveNodeFromConn'
import pluralizeHandler from './pluralizeHandler'

const handleRemoveTeamPromptTemplate = (
  templateId: string,
  teamId: string,
  store: RecordSourceSelectorProxy<any>
) => {
  const team = store.get(teamId)
  const settings = team?.getLinkedRecord('meetingSettings', {meetingType: 'teamPrompt'})
  safeRemoveNodeFromArray(templateId, settings, 'teamPromptTemplates')

  const viewer = store.getRoot().getLinkedRecord('viewer')
  const allAvailableConn =
    viewer && ConnectionHandler.getConnection(viewer, 'ActivityLibrary_availableTemplates')
  safeRemoveNodeFromConn(templateId, allAvailableConn)
  const allDetailsConn =
    viewer && ConnectionHandler.getConnection(viewer, 'ActivityDetails_availableTemplates')
  safeRemoveNodeFromConn(templateId, allDetailsConn)
}

const handleRemoveTeamPromptTemplates = pluralizeHandler(handleRemoveTeamPromptTemplate)
export default handleRemoveTeamPromptTemplates
