import plural from '../../../../../client/utils/plural'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import type {TeamHealthMeeting} from '../../../../postgres/types/Meeting'

export const getTeamHealthMetaBlock = async (
  meeting: TeamHealthMeeting,
  dataLoader: DataLoaderInstance
) => {
  const {id: meetingId} = meeting
  const responses = await dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
  const responderCount = new Set(responses.map(({userId}) => userId)).size
  const responderLabel = `${responderCount} ${plural(responderCount || 0, 'Respondent')}`
  return {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: `${responderLabel}`
      }
    ]
  }
}
