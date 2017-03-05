import {compositeId} from 'universal/validation/templates';
import legitify from './legitify';
import {columnArray} from 'universal/utils/constants';

export default function makeProjectSchema() {
  return legitify({
    id: compositeId,
    agendaId: compositeId,
    content: (value) => value
      .trim()
      .max(255, 'Whoa! That looks like 2 projects'),
    isArchived: (value) => value.boolean(),
    status: (value) => value
      // status may be empty eg unarchive card
      .test((str) => str && !columnArray.includes(str) && 'That isn\'t a status!'),
    teamMemberId: compositeId,
    sortOrder: (value) => value.float(),
  });
}
