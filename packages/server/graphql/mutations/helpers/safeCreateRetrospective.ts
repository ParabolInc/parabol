import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import generateUID from '../../../generateUID'
import {MeetingTypeEnum} from '../../../postgres/types/Meeting'
import {DataLoaderWorker} from '../../graphql'
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
    scheduledEndTime?: Date
    name: string
  },
  dataLoader: DataLoaderWorker
) => {
  const {teamId, facilitatorUserId, name} = meetingSettings
  const meetingType: MeetingTypeEnum = 'retrospective'
  const [meetingCount, team] = await Promise.all([
    dataLoader.get('meetingCount').load({teamId, meetingType}),
    dataLoader.get('teams').loadNonNull(teamId)
  ])

  const organization = await dataLoader.get('organizations').loadNonNull(team.orgId)
  const {showConversionModal} = organization

  const meetingId = generateUID()
  const phases = await createNewMeetingPhases(
    facilitatorUserId,
    teamId,
    meetingId,
    meetingCount,
    meetingType,
    dataLoader
  )

  return new MeetingRetrospective({
    id: meetingId,
    meetingCount,
    phases,
    showConversionModal,
    ...meetingSettings,
    name
  })
}

export default safeCreateRetrospective
