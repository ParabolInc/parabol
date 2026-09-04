import {ConnectionHandler, type RecordProxy, type RecordSourceSelectorProxy} from 'relay-runtime'
import addNodeToArray from '../../utils/relay/addNodeToArray'
import {putTemplateInConnection} from '../UpdatePokerTemplateScopeMutation'

const TEAM_TEMPLATES_FIELD = {
  retrospective: 'teamTemplates',
  poker: 'teamTemplates',
  teamPrompt: 'teamPromptTemplates'
} as const

const handleAddMeetingTemplate = (
  newNode: RecordProxy | null,
  meetingType: keyof typeof TEAM_TEMPLATES_FIELD,
  store: RecordSourceSelectorProxy
) => {
  if (!newNode) return
  const teamId = newNode.getValue('teamId') as string
  const team = store.get(teamId)
  if (!team) return
  const meetingSettings = team.getLinkedRecord('meetingSettings', {
    meetingType
  })
  if (meetingSettings) {
    addNodeToArray(newNode, meetingSettings, TEAM_TEMPLATES_FIELD[meetingType], 'name')
  }

  const viewer = store.getRoot().getLinkedRecord('viewer')
  const allTemplatesDetailsConn =
    viewer && ConnectionHandler.getConnection(viewer, 'ActivityDetails_availableTemplates')
  putTemplateInConnection(newNode, allTemplatesDetailsConn, store)
  const allTemplatesLibraryConn =
    viewer && ConnectionHandler.getConnection(viewer, 'ActivityLibrary_availableTemplates')
  putTemplateInConnection(newNode, allTemplatesLibraryConn, store)
}

export default handleAddMeetingTemplate
