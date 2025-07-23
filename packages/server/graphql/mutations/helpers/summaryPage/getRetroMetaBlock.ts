import plural from '../../../../../client/utils/plural'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import type {RetrospectiveMeeting} from '../../../../postgres/types/Meeting'

export const getRetroMetaBlock = async (
  meeting: RetrospectiveMeeting,
  dataLoader: DataLoaderInstance
) => {
  const {id: meetingId, topicCount, taskCount, reflectionCount} = meeting
  const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)
  const topicLabel = plural(topicCount || 0, 'Topic')
  const taskLabel = plural(taskCount || 0, 'New Task')
  const reflectionLabel = plural(reflectionCount || 0, 'Reflection')
  const participantLabel = plural(meetingMembers.length, 'Participant')
  return {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: `${topicLabel} - ${taskLabel} - ${reflectionLabel} - ${participantLabel}`
      }
    ]
  }
}
