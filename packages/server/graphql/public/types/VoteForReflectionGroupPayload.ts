import MeetingMemberId from '../../../../client/shared/gqlIds/MeetingMemberId'
import type {VoteForReflectionGroupPayloadResolvers} from '../resolverTypes'

export type VoteForReflectionGroupPayloadSource =
  | {meetingId: string; userId: string; reflectionGroupId: string}
  | {error: {message: string}}

const VoteForReflectionGroupPayload: VoteForReflectionGroupPayloadResolvers = {
  meeting: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('newMeetings').loadNonNull(source.meetingId)
  },
  meetingMember: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {meetingId, userId} = source
    const meetingMemberId = MeetingMemberId.join(meetingId, userId)
    return (await dataLoader.get('meetingMembers').load(meetingMemberId)) ?? null
  },
  reflectionGroup: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return (await dataLoader.get('retroReflectionGroups').load(source.reflectionGroupId)) ?? null
  }
}

export default VoteForReflectionGroupPayload
