import {compositeId} from 'universal/validation/templates';
import legitify from './legitify';

export default function makeAgendaItemSchema() {
  return legitify({
    id: compositeId,
    content: (value) => value
      .trim()
      .max(50, 'Try something a little shorter'),
    isActive: (value) => value.boolean(),
    isComplete: (value) => value.boolean(),
    sortOrder: (value) => value.float(),
    teamMemberId: compositeId,
  });
}
