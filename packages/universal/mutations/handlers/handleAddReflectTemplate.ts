import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {RETROSPECTIVE} from '../../utils/constants'
import addNodeToArray from '../../utils/relay/addNodeToArray'
import {DeepNullable} from '../../types/generics'
import {IRetrospectiveMeetingSettings, ITeam} from '../../types/graphql'

const handleAddReflectTemplate = (
  newNode: RecordProxy | null,
  store: RecordSourceSelectorProxy
) => {
  if (!newNode) return
  const teamId = newNode.getValue('teamId')
  const team = store.get<DeepNullable<ITeam>>(teamId)
  if (!team) return
  const meetingSettings = team.getLinkedRecord<IRetrospectiveMeetingSettings>('meetingSettings', {
    meetingType: RETROSPECTIVE
  })
  if (!meetingSettings) return
  addNodeToArray(newNode, meetingSettings, 'reflectTemplates', 'name')
}

export default handleAddReflectTemplate
