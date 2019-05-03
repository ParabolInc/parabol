import GenericMeetingStage from 'server/database/types/GenericMeetingStage'

export default class AgendaItemStage extends GenericMeetingStage {
  constructor (public agendaItemId: string) {
    super()
  }
}
