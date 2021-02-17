import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {IRetrospectiveMeetingSettings} from '../../types/graphql'
import addNodeToArray from '../../utils/relay/addNodeToArray'

const handleAddReflectTemplate = (
  newNode: RecordProxy | null,
  store: RecordSourceSelectorProxy
) => {
  if (!newNode) return
  const teamId = newNode.getValue('teamId') as string
  const team = store.get(teamId)
  if (!team) return
  const meetingSettings = team.getLinkedRecord<IRetrospectiveMeetingSettings>('meetingSettings', {
    meetingType: 'retrospective'
  })
  if (!meetingSettings) return
  addNodeToArray(newNode, meetingSettings, 'teamTemplates', 'name')
}

export default handleAddReflectTemplate
