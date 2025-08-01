import plural from '../../../../../client/utils/plural'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import type {PokerMeeting} from '../../../../postgres/types/Meeting'

export const getPokerMetaBlock = async (meeting: PokerMeeting, dataLoader: DataLoaderInstance) => {
  const {id: meetingId, storyCount} = meeting
  const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)
  const storyLabel = `${storyCount} ${plural(storyCount || 0, 'Story', 'Stories')}`
  const participantLabel = `${meetingMembers.length} ${plural(meetingMembers.length, 'Participant')}`
  return {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: `${storyLabel} - ${participantLabel}`
      }
    ]
  }
}
