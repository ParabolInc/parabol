import type {StartDraggingReflectionPayloadResolvers} from '../resolverTypes'

type RemoteDrag = {
  id: string
  sourceId: string
  dragUserId: string
  isSpotlight?: boolean | null
}

export type StartDraggingReflectionPayloadSource =
  | {teamId: string; meetingId: string; reflectionId: string; remoteDrag: RemoteDrag}
  | {error: {message: string}}

const StartDraggingReflectionPayload: StartDraggingReflectionPayloadResolvers = {
  meeting: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return (await dataLoader.get('newMeetings').load(source.meetingId)) ?? null
  },
  reflection: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return (await dataLoader.get('retroReflections').load(source.reflectionId)) ?? null
  }
}

export default StartDraggingReflectionPayload
