import {AddAgendaItemPayloadResolvers} from '../resolverTypes'

export type AddAgendaItemPayloadSource =
  | {
      agendaItemId: string
      meetingId?: string
    }
  | {error: {message: string}}

const AddAgendaItemPayload: AddAgendaItemPayloadResolvers = {
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

export default AddAgendaItemPayload
