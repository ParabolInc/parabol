import {compositeId, id} from './templates'
import legitify from './legitify'

export default function makeAgendaItemSchema() {
  return legitify({
    content: (value) => value.trim().max(63, 'Try something a little shorter'),
    isActive: (value) => value.boolean(),
    pinned: (value) => value.boolean(),
    sortOrder: (value) => value.float(),
    teamId: id,
    teamMemberId: compositeId
  })
}
