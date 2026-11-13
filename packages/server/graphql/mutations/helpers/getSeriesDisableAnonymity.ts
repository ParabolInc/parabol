import type {MeetingSeries} from '../../../postgres/types'
import type {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import type {DataLoaderWorker} from '../../graphql'

// Fallback: series (null until set there) > prior meeting > MeetingSettings (may be missing) > false
const getSeriesDisableAnonymity = async (
  meetingSeries: Pick<MeetingSeries, 'id' | 'teamId' | 'disableAnonymity'>,
  dataLoader: DataLoaderWorker
) => {
  const {id: meetingSeriesId, teamId, disableAnonymity} = meetingSeries
  if (disableAnonymity !== null) return disableAnonymity
  const [lastMeeting, meetingSettings] = await Promise.all([
    dataLoader.get('lastMeetingByMeetingSeriesId').load(meetingSeriesId),
    dataLoader.get('meetingSettingsByType').load({teamId, meetingType: 'retrospective'})
  ])
  const retroLastMeeting = lastMeeting as RetrospectiveMeeting | null
  return retroLastMeeting?.disableAnonymity ?? meetingSettings?.disableAnonymity ?? false
}

export default getSeriesDisableAnonymity
