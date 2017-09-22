import {ContentState, convertToRaw} from 'draft-js';
import {columnArray, PROJECT_MAX_CHARS} from 'universal/utils/constants';
import {compositeId} from 'universal/validation/templates';
import legitify from './legitify';

const makeEmptyStr = () => JSON.stringify(convertToRaw(ContentState.createFromText('')));

export default function makeProjectSchema() {
  return legitify({
    id: compositeId,
    agendaId: compositeId,
    content: (value) => value
      .normalize((str) => {
        let parsedContent;
        try {
          parsedContent = JSON.parse(str);
        } catch (e) {
          return makeEmptyStr();
        }
        const keys = Object.keys(parsedContent);
        if (keys.length !== 2 ||
          typeof parsedContent.entityMap !== 'object' ||
          !Array.isArray(parsedContent.blocks ||
          parsedContent.blocks.length === 0)) {
          return makeEmptyStr();
        }
        // remove empty first block
        const {blocks} = parsedContent;
        const firstBlockIdx = blocks.findIndex((block) => Boolean(block.text.replace(/\s/g, '')));
        if (firstBlockIdx === -1) {
          return makeEmptyStr();
        }
        if (firstBlockIdx > 0) {
          return JSON.stringify({
            ...parsedContent,
            blocks: blocks.slice(firstBlockIdx)
          });
        }
        return str;
      })
      .max(PROJECT_MAX_CHARS, 'Whoa! That looks like 2 projects'),
    status: (value) => value
    // status may be empty eg unarchive card
      .test((str) => str && !columnArray.includes(str) && 'That isn’t a status!'),
    teamMemberId: compositeId,
    sortOrder: (value) => value.float()
  });
}
