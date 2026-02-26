import type {ReflectPhaseCompletePayloadResolvers} from '../resolverTypes'
import type {RetroReflectionGroupSource} from './RetroReflectionGroup'

export type ReflectPhaseCompletePayloadSource = {
  emptyReflectionGroupIds: string[]
  reflectionGroups: RetroReflectionGroupSource[]
}

const ReflectPhaseCompletePayload: ReflectPhaseCompletePayloadResolvers = {}

export default ReflectPhaseCompletePayload
