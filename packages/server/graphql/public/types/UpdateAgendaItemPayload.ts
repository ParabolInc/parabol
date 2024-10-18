import {UpdateAgendaItemPayloadResolvers} from '../resolverTypes'

export type UpdateAgendaItemPayloadSource =
  | {
      agendaItemId: string
      meetingId?: string | null
    }
  | {error: {message: string}}

const UpdateAgendaItemPayload: UpdateAgendaItemPayloadResolvers = {
  agendaItem: (source, _args, {dataLoader}) => {
    return 'agendaItemId' in source
      ? dataLoader.get('agendaItems').loadNonNull(source.agendaItemId)
      : null
  },

  meeting: (source, _args, {dataLoader}) => {
    return 'meetingId' in source && source.meetingId
      ? dataLoader.get('newMeetings').loadNonNull(source.meetingId)
      : null
  }
}

export default UpdateAgendaItemPayload
