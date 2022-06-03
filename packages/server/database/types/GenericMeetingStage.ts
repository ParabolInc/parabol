import ms from 'ms'
import generateUID from '../../generateUID'

const MAX_SYNC_STAGE_DURATION = ms('1h')

// https://stackoverflow.com/a/20811670/3155110
const filterOutliers = (someArray: number[]) => {
  const values = someArray.concat()
  if (values.length === 0) return []
  values.sort(function (a, b) {
    return a - b
  })
  const q1 = values[Math.floor(values.length / 4)]!
  const q3 = values[Math.ceil(values.length * (3 / 4))]!
  const iqr = q3 - q1

  const maxValue = q3 + iqr * 1.5
  const minValue = q1 - iqr * 1.5
  return values.filter((x) => x <= maxValue && x >= minValue)
}

// allDurations is sorted by age, descending
const getSuggestedDuration = (filteredDurations: number[], allDurations: number[]) => {
  return allDurations.find((duration) => filteredDurations.includes(duration))
}

export interface GenericMeetingStageInput {
  durations?: number[] | undefined
  phaseType: string
  id?: string
  isNavigable?: boolean
  isNavigableByFacilitator?: boolean
  startAt?: Date
  viewCount?: number
}

export default class GenericMeetingStage {
  id: string
  isAsync: boolean | undefined | null
  isComplete = false
  isNavigable: boolean
  isNavigableByFacilitator: boolean
  startAt: Date | undefined
  endAt: Date | undefined = undefined
  scheduledEndTime: Date | undefined | null
  suggestedEndTime: Date | undefined
  suggestedTimeLimit: number | undefined
  viewCount: number
  readyToAdvance: string[] | undefined = []
  phaseType: string
  constructor(input: GenericMeetingStageInput) {
    const {durations, phaseType, id, isNavigable, isNavigableByFacilitator, startAt, viewCount} =
      input
    this.id = id || generateUID()
    this.phaseType = phaseType
    this.isNavigable = isNavigable ?? false
    this.isNavigableByFacilitator = isNavigableByFacilitator ?? false
    this.startAt = startAt ?? undefined
    this.viewCount = viewCount ?? 0

    if (durations) {
      const shortDurations = filterOutliers(
        durations.filter((duration) => duration < MAX_SYNC_STAGE_DURATION)
      )
      const longDurations = filterOutliers(
        durations.filter((duration) => duration >= MAX_SYNC_STAGE_DURATION)
      )
      // naively estimate the time limit to be how long it took them last time (ignoring outliers)
      this.suggestedTimeLimit = getSuggestedDuration(shortDurations, durations)
      const longDuration = getSuggestedDuration(longDurations, durations)
      this.suggestedEndTime = longDuration ? new Date(Date.now() + longDuration) : undefined
    }
  }
}
