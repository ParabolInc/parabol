import {REFLECT} from 'parabol-client/utils/constants'
import type {SetPhaseFocusPayloadResolvers} from '../resolverTypes'

export type SetPhaseFocusPayloadSource = {meetingId: string} | {error: {message: string}}

const SetPhaseFocusPayload: SetPhaseFocusPayloadResolvers = {
  meeting: (source, _args, {dataLoader}) => {
    if ('error' in source) return null as any
    return dataLoader.get('newMeetings').loadNonNull(source.meetingId)
  },
  reflectPhase: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null as any
    const meeting = await dataLoader.get('newMeetings').loadNonNull(source.meetingId)
    const {phases, teamId} = meeting
    const phase = phases.find((phase) => phase.phaseType === REFLECT)!
    return {...phase, meetingId: source.meetingId, teamId}
  }
}

export default SetPhaseFocusPayload
