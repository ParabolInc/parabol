import GenericMeetingStage from 'server/database/types/GenericMeetingStage'

export default class AgendaItemsStage extends GenericMeetingStage {
  constructor (public agendaItemId: string) {
    super()
  }
}
