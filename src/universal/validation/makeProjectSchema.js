import {compositeId} from 'universal/validation/templates';
import {columnArray} from 'universal/utils/constants';
import legitify from './legitify';
import {PROJECT_MAX_CHARS} from 'universal/utils/constants';

export default function makeProjectSchema() {
  return legitify({
    id: compositeId,
    agendaId: compositeId,
    content: (value) => value
      .trim()
      .max(PROJECT_MAX_CHARS, 'Whoa! That looks like 2 projects'),
    isArchived: (value) => value.boolean(),
    status: (value) => value
      // status may be empty eg unarchive card
      .test((str) => str && !columnArray.includes(str) && 'That isn\'t a status!'),
    teamMemberId: compositeId,
    sortOrder: (value) => value.float(),
  });
}
