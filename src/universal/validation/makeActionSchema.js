import {compositeId} from 'universal/validation/templates';
import legitify from './legitify';

export default function makeActionSchema() {
  return legitify({
    id: compositeId,
    teamMemberId: compositeId,
    content: (value) => value
      .trim()
      .max(200, 'Whoa! That looks like 2 actions'),
    agendaId: compositeId,
  });
}
