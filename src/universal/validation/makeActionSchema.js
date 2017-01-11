import {compositeId} from 'universal/validation/templates';
import legitify from './legitify';

export default function makeActionSchema() {
  return legitify({
    id: compositeId,
    agendaId: compositeId,
    content: (value) => value
      .trim()
      .max(255, 'Whoa! That looks like 2 actions'),
    isComplete: (value) => value.boolean(),
    sortOrder: (value) => value.float(),
    teamMemberId: compositeId
  });
}
