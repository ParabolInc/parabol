import type {EndDraggingReflectionPayloadResolvers} from '../resolverTypes'

export type EndDraggingReflectionPayloadSource = {
  meetingId: string
  reflectionId: string
  reflectionGroupId: string | undefined
  oldReflectionGroupId: string
  userId: string
  dropTargetType: string | null | undefined
  dropTargetId: string | null | undefined
  remoteDrag: {id: string; dragUserId: string} | null
}

const EndDraggingReflectionPayload: EndDraggingReflectionPayloadResolvers = {
  meeting: async (source, _args, {dataLoader}) => {
    return (await dataLoader.get('newMeetings').load(source.meetingId)) ?? null
  },
  reflection: async (source, _args, {dataLoader}) => {
    return (await dataLoader.get('retroReflections').load(source.reflectionId)) ?? null
  },
  reflectionGroup: async (source, _args, {dataLoader}) => {
    if (!source.reflectionGroupId) return null
    return (await dataLoader.get('retroReflectionGroups').load(source.reflectionGroupId)) ?? null
  },
  oldReflectionGroup: async (source, _args, {dataLoader}) => {
    return (await dataLoader.get('retroReflectionGroups').load(source.oldReflectionGroupId)) ?? null
  }
}

export default EndDraggingReflectionPayload
