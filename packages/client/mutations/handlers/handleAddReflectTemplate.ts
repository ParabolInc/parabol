import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {IRetrospectiveMeetingSettings} from '../../types/graphql'
import {RETROSPECTIVE} from '../../utils/constants'
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
    meetingType: RETROSPECTIVE
  })
  if (!meetingSettings) return
  addNodeToArray(newNode, meetingSettings, 'teamTemplates', 'name')
}

export default handleAddReflectTemplate
