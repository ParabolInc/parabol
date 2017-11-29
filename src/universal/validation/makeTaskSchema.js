import {columnArray, TASK_MAX_CHARS} from 'universal/utils/constants';
import {compositeId} from 'universal/validation/templates';
import legitify from './legitify';
import normalizeRawDraftJS from 'universal/validation/normalizeRawDraftJS';

export default function makeTaskSchema() {
  return legitify({
    id: compositeId,
    agendaId: compositeId,
    content: (value) => value
      .normalize(normalizeRawDraftJS)
      .max(TASK_MAX_CHARS, 'Whoa! That looks like 2 tasks'),
    status: (value) => value
    // status may be empty eg unarchive card
      .test((str) => str && !columnArray.includes(str) && 'That isn’t a status!'),
    teamMemberId: compositeId,
    sortOrder: (value) => value.float()
  });
}
