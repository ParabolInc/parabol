import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import type {MeetingTypeEnum, RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import type {RetroMeetingPhase} from '../../../postgres/types/NewMeetingPhase'
import type {DataLoaderWorker} from '../../graphql'
import createNewMeetingPhases from './createNewMeetingPhases'

const safeCreateRetrospective = async (
  meetingSettings: {
    teamId: string
    facilitatorUserId: string
    totalVotes: number
    maxVotesPerGroup: number
    disableAnonymity: boolean
    templateId: string
    videoMeetingURL?: string
    meetingSeriesId?: number
    scheduledEndTime?: Date | null
    name: string
  },
  dataLoader: DataLoaderWorker
) => {
  const pg = getKysely()
  const {teamId, facilitatorUserId, name} = meetingSettings
  const meetingType: MeetingTypeEnum = 'retrospective'
  const meetingCount = await dataLoader.get('meetingCount').load({teamId, meetingType})

  const meetingId = generateUID()
  const [phases, inserts] = await createNewMeetingPhases<RetroMeetingPhase>(
    facilitatorUserId,
    teamId,
    meetingId,
    meetingCount,
    meetingType,
    dataLoader
  )

  const meeting = new MeetingRetrospective({
    id: meetingId,
    meetingCount,
    phases,
    ...meetingSettings,
    name
  }) as RetrospectiveMeeting
  try {
    await pg.transaction().execute(async (pg) => {
      await pg
        .insertInto('NewMeeting')
        .values({...meeting, phases: JSON.stringify(meeting.phases)})
        .execute()
      await Promise.all(inserts.map((insert) => pg.executeQuery(insert)))
    })
  } catch {
    // meeting already started
    return null
  }
  return meeting
}

export default safeCreateRetrospective
