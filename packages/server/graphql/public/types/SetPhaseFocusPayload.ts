import {REFLECT} from 'parabol-client/utils/constants'
import type {SetPhaseFocusPayloadResolvers} from '../resolverTypes'

export type SetPhaseFocusPayloadSource = {meetingId: string}

const SetPhaseFocusPayload: SetPhaseFocusPayloadResolvers = {
  meeting: (source, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(source.meetingId)
  },
  reflectPhase: async (source, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(source.meetingId)
    const {phases, teamId} = meeting
    const phase = phases.find((phase) => phase.phaseType === REFLECT)!
    return {...phase, meetingId: source.meetingId, teamId}
  }
}

export default SetPhaseFocusPayload
