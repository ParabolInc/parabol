import type {PushInvitationPayloadResolvers} from '../resolverTypes'

export type PushInvitationPayloadSource =
  | {userId: string; teamId: string; meetingId?: string | null}
  | {error: {message: string}}

const PushInvitationPayload: PushInvitationPayloadResolvers = {
  user: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return (await dataLoader.get('users').load(source.userId)) ?? null
  },
  team: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return (await dataLoader.get('teams').load(source.teamId)) ?? null
  }
}

export default PushInvitationPayload
