import {columnArray, PROJECT_MAX_CHARS} from 'universal/utils/constants';
import normalizeRawDraftJS from 'universal/validation/normalizeRawDraftJS';
import {compositeId, id} from 'universal/validation/templates';
import legitify from './legitify';

export default function makeProjectSchema() {
  return legitify({
    agendaId: compositeId,
    content: (value) => value
      .normalize(normalizeRawDraftJS)
      .max(PROJECT_MAX_CHARS, 'Whoa! That looks like 2 projects'),
    status: (value) => value
    // status may be empty eg unarchive card
      .test((str) => str && !columnArray.includes(str) && 'That isn’t a status!'),
    teamId: id,
    userId: id,
    sortOrder: (value) => value.float()
  });
}
