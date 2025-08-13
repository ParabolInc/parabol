import plural from '../../../../../client/utils/plural'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import type {CheckInMeeting} from '../../../../postgres/types/Meeting'

export const getCheckinMetaBlock = async (
  meeting: CheckInMeeting,
  dataLoader: DataLoaderInstance
) => {
  const {id: meetingId, agendaItemCount, taskCount} = meeting
  const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)
  const topicLabel = `${agendaItemCount} ${plural(agendaItemCount || 0, 'Agenda Item')}`
  const taskLabel = `${taskCount} ${plural(taskCount || 0, 'New Task')}`
  const participantLabel = `${meetingMembers.length} ${plural(meetingMembers.length, 'Participant')}`
  return {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: `${topicLabel} - ${taskLabel} - ${participantLabel}`
      }
    ]
  }
}
