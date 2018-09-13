import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {RETROSPECTIVE} from 'universal/utils/constants'
import addNodeToArray from 'universal/utils/relay/addNodeToArray'

const handleAddReflectTemplate = (
  newNode: RecordProxy | null,
  store: RecordSourceSelectorProxy
) => {
  if (!newNode) return
  const teamId = newNode.getValue('teamId')
  const team = store.get(teamId)
  if (!team) return
  const meetingSettings = team.getLinkedRecord('meetingSettings', {meetingType: RETROSPECTIVE})
  if (!meetingSettings) return
  addNodeToArray(newNode, meetingSettings, 'reflectTemplates', 'name')
}

export default handleAddReflectTemplate
