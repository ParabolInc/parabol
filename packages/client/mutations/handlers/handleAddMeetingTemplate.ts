import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import addNodeToArray from '../../utils/relay/addNodeToArray'
import {putTemplateInConnection} from '../UpdatePokerTemplateScopeMutation'

const handleAddMeetingTemplate = (
  newNode: RecordProxy | null,
  meetingType: 'retrospective' | 'poker',
  store: RecordSourceSelectorProxy
) => {
  if (!newNode) return
  const teamId = newNode.getValue('teamId') as string
  const team = store.get(teamId)
  if (!team) return
  const meetingSettings = team.getLinkedRecord('meetingSettings', {
    meetingType
  })
  if (!meetingSettings) return
  addNodeToArray(newNode, meetingSettings, 'teamTemplates', 'name')

  const viewer = store.getRoot().getLinkedRecord('viewer')
  const allTemplatesDetailsConn =
    viewer && ConnectionHandler.getConnection(viewer, 'ActivityDetails_availableTemplates')
  putTemplateInConnection(newNode, allTemplatesDetailsConn, store)
  const allTemplatesLibraryConn =
    viewer && ConnectionHandler.getConnection(viewer, 'ActivityLibrary_availableTemplates')
  putTemplateInConnection(newNode, allTemplatesLibraryConn, store)
}

export default handleAddMeetingTemplate
