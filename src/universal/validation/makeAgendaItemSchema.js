import {compositeId} from 'universal/validation/templates';
import legitify from './legitify';

export default function makeAgendaItemSchema() {
  return legitify({
    id: compositeId,
    teamMemberId: compositeId,
    content: (value) => value
      .trim()
      .max(50, 'Try something a little shorter'),
  });
}
