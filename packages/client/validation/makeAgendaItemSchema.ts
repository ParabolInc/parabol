import {compositeId, id} from './templates'
import legitify from './legitify'
import Legitity from './Legitity'

export default function makeAgendaItemSchema() {
  return legitify({
    content: (value: Legitity) => value.trim().max(63, 'Try something a little shorter'),
    isActive: (value: Legitity) => value.boolean(),
    pinned: (value: Legitity) => value.boolean(),
    sortOrder: (value: Legitity) => value.float(),
    teamId: id,
    teamMemberId: compositeId
  })
}
