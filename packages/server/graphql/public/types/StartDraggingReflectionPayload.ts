import type {StartDraggingReflectionPayloadResolvers} from '../resolverTypes'

type RemoteDrag = {
  id: string
  sourceId: string
  dragUserId: string
  isSpotlight?: boolean | null
}

export type StartDraggingReflectionPayloadSource = {
  teamId: string
  meetingId: string
  reflectionId: string
  remoteDrag: RemoteDrag
}

const StartDraggingReflectionPayload: StartDraggingReflectionPayloadResolvers = {
  meeting: async (source, _args, {dataLoader}) => {
    return (await dataLoader.get('newMeetings').load(source.meetingId)) ?? null
  },
  reflection: async (source, _args, {dataLoader}) => {
    return (await dataLoader.get('retroReflections').load(source.reflectionId)) ?? null
  }
}

export default StartDraggingReflectionPayload
