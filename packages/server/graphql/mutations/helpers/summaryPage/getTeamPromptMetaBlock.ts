import plural from '../../../../../client/utils/plural'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import type {PokerMeeting} from '../../../../postgres/types/Meeting'

export const getTeamPromptMetaBlock = async (
  meeting: PokerMeeting,
  dataLoader: DataLoaderInstance
) => {
  const {id: meetingId} = meeting
  const responses = await dataLoader.get('teamPromptResponsesByMeetingId').load(meetingId)
  const responseCount = responses.length
  const responseLabel = `${responseCount} ${plural(responseCount || 0, 'Response')}`
  return {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: `${responseLabel}`
      }
    ]
  }
}
