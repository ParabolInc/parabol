import generateUID from '../../generateUID'
import {MeetingTypeEnum} from '../../postgres/types/Meeting'
import GenericMeetingPhase from './GenericMeetingPhase'

interface Input {
  id?: string
  teamId: string
  meetingType: MeetingTypeEnum
  meetingCount: number
  name?: string
  // Every meeting has at least one phase
  phases: [GenericMeetingPhase, ...GenericMeetingPhase[]]
  facilitatorUserId: string
  showConversionModal?: boolean
  meetingSeriesId?: number
  scheduledEndTime?: Date
  summary?: string
  sentimentScore?: number
}

const namePrefix = {
  action: 'Check-in',
  retrospective: 'Retro'
} as Record<MeetingTypeEnum, string>
export default abstract class Meeting {
  id: string
  isLegacy?: boolean // true if old version of action meeting
  createdAt = new Date()
  updatedAt = new Date()
  createdBy: string
  endedAt: Date | undefined | null = undefined
  facilitatorStageId: string | undefined
  facilitatorUserId: string
  meetingCount: number
  meetingNumber: number
  name: string
  summarySentAt: Date | undefined = undefined
  teamId: string
  meetingType: MeetingTypeEnum
  phases: GenericMeetingPhase[]
  showConversionModal?: boolean
  meetingSeriesId?: number
  scheduledEndTime?: Date | null
  summary?: string
  sentimentScore?: number

  constructor(input: Input) {
    const {
      id,
      teamId,
      facilitatorUserId,
      meetingCount,
      meetingType,
      name,
      phases,
      showConversionModal,
      meetingSeriesId,
      scheduledEndTime,
      summary,
      sentimentScore
    } = input
    this.id = id ?? generateUID()
    this.createdBy = facilitatorUserId
    this.facilitatorStageId = phases[0]?.stages[0]?.id
    this.facilitatorUserId = facilitatorUserId
    this.meetingCount = meetingCount
    this.meetingNumber = meetingCount + 1
    this.meetingType = meetingType
    this.name = name ?? `${namePrefix[meetingType]} #${this.meetingNumber}`
    this.phases = phases
    this.teamId = teamId
    this.showConversionModal = showConversionModal
    this.meetingSeriesId = meetingSeriesId
    this.scheduledEndTime = scheduledEndTime
    this.summary = summary
    this.sentimentScore = sentimentScore
  }
}
