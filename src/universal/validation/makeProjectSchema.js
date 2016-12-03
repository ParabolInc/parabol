import {compositeId} from 'universal/validation/templates';
import legitify from './legitify';
import {columnArray} from 'universal/utils/constants';

export default function makeProjectSchema() {
  return legitify({
    id: compositeId,
    teamMemberId: compositeId,
    content: (value) => value
      .trim()
      .max(200, 'Whoa! That looks like 2 projects'),
    agendaId: compositeId,
    status: (value) => value
      .test((str) => !columnArray.includes(str) && 'That isn\'t a status!')
  });
}
