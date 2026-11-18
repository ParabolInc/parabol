export type RetroSettingId = 'template' | 'anonymity' | 'reviewTasks' | 'icebreaker'
export type RetroPhaseSettingId = 'reviewTasks' | 'icebreaker'

export const PHASE_SETTINGS = {
  icebreaker: {phaseType: 'checkin', variable: 'checkinEnabled'},
  reviewTasks: {phaseType: 'updates', variable: 'reviewPastTasksEnabled'}
} as const satisfies Record<RetroPhaseSettingId, {phaseType: string; variable: string}>

interface MeetingState {
  isRecurring: boolean
  isViewerFacilitator: boolean
  facilitatorPhaseType: string | undefined
  phaseTypes: readonly string[]
  hasReflections: boolean
  isReflectDone: boolean
}

const getPassedSettings = (state: MeetingState): Record<RetroSettingId, boolean> => {
  const {facilitatorPhaseType, phaseTypes, isViewerFacilitator, hasReflections, isReflectDone} =
    state
  const reflectIdx = phaseTypes.indexOf('reflect')
  const currentIdx = facilitatorPhaseType ? phaseTypes.indexOf(facilitatorPhaseType) : -1
  const hasReflectStarted = currentIdx >= reflectIdx
  // ending a phase the meeting is in moves the meeting along, which only the facilitator can do
  const isInPhase = (phaseType: string) => facilitatorPhaseType === phaseType && isViewerFacilitator
  const isPastReflecting = hasReflections || isReflectDone
  return {
    template: isPastReflecting,
    anonymity: isPastReflecting,
    reviewTasks: hasReflectStarted || (facilitatorPhaseType === 'updates' && !isInPhase('updates')),
    icebreaker: !isInPhase('checkin')
  }
}

// The earliest to pass sits lowest, so the Future meetings heading slides up past rows
const SETTING_ORDER: RetroSettingId[] = ['template', 'anonymity', 'reviewTasks', 'icebreaker']

const getRetroSettingSections = (state: MeetingState) => {
  const passed = getPassedSettings(state)
  const forThisMeeting = SETTING_ORDER.filter((id) => !passed[id])
  const forFutureMeetings = state.isRecurring ? SETTING_ORDER.filter((id) => passed[id]) : []
  return {forThisMeeting, forFutureMeetings}
}

export default getRetroSettingSections
