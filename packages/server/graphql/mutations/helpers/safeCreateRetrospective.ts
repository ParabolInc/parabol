import getRethink from '../../../database/rethinkDriver'
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
  },
  dataLoader: DataLoaderWorker
) => {
  const r = await getRethink()
  const {teamId, facilitatorUserId} = meetingSettings
  const meetingType: MeetingTypeEnum = 'retrospective'
  const [meetingCount, team] = await Promise.all([
    r
      .table('NewMeeting')
      .getAll(teamId, {index: 'teamId'})
      .filter({meetingType})
      .count()
      .default(0)
      .run(),
    dataLoader.get('teams').loadNonNull(teamId)
  ])

  const organization = await r.table('Organization').get(team.orgId).run()
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
    ...meetingSettings
  })
}

export default safeCreateRetrospective
