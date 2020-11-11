import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {IPokerMeetingSettings, MeetingTypeEnum} from '../../types/graphql'
import addNodeToArray from '../../utils/relay/addNodeToArray'

const handleAddPokerTemplateScale = (
  newNode: RecordProxy | null,
  store: RecordSourceSelectorProxy
) => {
  if (!newNode) return
  const teamId = newNode.getValue('teamId') as string
  const team = store.get(teamId)
  if (!team) return
  const meetingSettings = team.getLinkedRecord<IPokerMeetingSettings>('meetingSettings', {
    meetingType: MeetingTypeEnum.poker
  })
  if (!meetingSettings) return
  addNodeToArray(newNode, meetingSettings, 'teamScales', 'name')
}

export default handleAddPokerTemplateScale
