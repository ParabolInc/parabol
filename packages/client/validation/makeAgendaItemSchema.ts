import legitify from './legitify'
import Legitity from './Legitity'
import {compositeId, id} from './templates'

export const AGENDA_ITEM_MAX_CHARS = 63

export const contentValidator = (value: Legitity) =>
  value
    .trim()
    .required('Please enter an agenda item')
    .max(AGENDA_ITEM_MAX_CHARS, 'Try something a little shorter')

export default function makeAgendaItemSchema() {
  return legitify({
    content: contentValidator,
    isActive: (value: Legitity) => value.boolean(),
    pinned: (value: Legitity) => value.boolean(),
    sortOrder: (value: Legitity) => value.float(),
    teamId: id,
    teamMemberId: compositeId
  })
}
