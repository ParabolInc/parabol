import type {PhaseCompletePayloadResolvers} from '../resolverTypes'
import type {GroupPhaseCompletePayloadSource} from './GroupPhaseCompletePayload'
import type {ReflectPhaseCompletePayloadSource} from './ReflectPhaseCompletePayload'
import type {VotePhaseCompletePayloadSource} from './VotePhaseCompletePayload'

export type PhaseCompletePayloadSource = {
  reflect?: ReflectPhaseCompletePayloadSource
  group?: GroupPhaseCompletePayloadSource
  vote?: VotePhaseCompletePayloadSource
}

const PhaseCompletePayload: PhaseCompletePayloadResolvers = {}

export default PhaseCompletePayload
