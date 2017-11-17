import maybeFromGlobalId from 'server/utils/maybeFromGlobalId';
import {columnArray, PROJECT_MAX_CHARS} from 'universal/utils/constants';
import normalizeRawDraftJS from 'universal/validation/normalizeRawDraftJS';
import legitify from './legitify';
import {compositeIdRegex} from 'universal/validation/regex';

export default function makeProjectSchema() {
  return legitify({
    agendaId: (value) => value
      .normalize((str) => {
        try {
          return maybeFromGlobalId(str, 'AgendaItem')
        } catch (e) {
          return null;
        }
      }, 'Invalid global AgendaId')
      .matches(compositeIdRegex),
    content: (value) => value
      .normalize(normalizeRawDraftJS)
      .max(PROJECT_MAX_CHARS, 'Whoa! That looks like 2 projects'),
    status: (value) => value
    // status may be empty eg unarchive card
      .test((str) => str && !columnArray.includes(str) && 'That isn’t a status!'),
    teamMemberId: (value) => value
      .normalize((str) => {
        try {
          return maybeFromGlobalId(str, 'TeamMember')
        } catch (e) {
          return null;
        }
      }, 'Invalid global TeamMemberId')
      .matches(compositeIdRegex),
    sortOrder: (value) => value.float()
  });
}
