import {compositeId, id} from 'universal/validation/templates';
import legitify from './legitify';

export default function makeUpdateAgendaItemSchema() {
  return legitify({
    id: compositeId,
    content: (value) => value
      .trim()
      .max(63, 'Try something a little shorter'),
    isActive: (value) => value.boolean(),
    isComplete: (value) => value.boolean(),
    sortOrder: (value) => value.float(),
    teamId: id,
    teamMemberId: compositeId
  });
}
