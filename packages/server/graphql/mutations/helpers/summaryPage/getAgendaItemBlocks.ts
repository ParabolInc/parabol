import plural from '../../../../../client/utils/plural'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'

export const getAgendaItemBlocks = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const agendaItems = await dataLoader.get('agendaItemsByMeetingId').load(meetingId)
  if (!agendaItems.length) return []
  return [
    {
      type: 'heading',
      attrs: {level: 2},
      content: [
        {
          type: 'text',
          text: `${agendaItems.length} ${plural(agendaItems.length, 'Agenda Item')}`
        }
      ]
    },
    {
      type: 'bulletList',
      attrs: {tight: true},
      content: agendaItems.map((agendaItem) => {
        const {content} = agendaItem
        return {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: content
                }
              ]
            }
          ]
        }
      })
    }
  ]
}
