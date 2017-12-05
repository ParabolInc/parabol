import {cashay} from 'cashay';
import {DND_THROTTLE, MEETING, TEAM_DASH, USER_DASH} from 'universal/utils/constants';

const areaOpLookup = {
  [MEETING]: 'meetingUpdatesContainer',
  [USER_DASH]: 'userColumnsContainer',
  [TEAM_DASH]: 'teamColumnsContainer'
};

/**
 * Handles column-level drops.  When a card is dropped onto a status column, it
 * is migrated to that column, ignoring sort order.  This is a relatively rare
 * case.  Usually card drag-and-drop is handled by the card drop targets, which,
 * when they receive drop, order the dropped card appropriately.  This only
 * should be called when you drop a card on an empty column, or drop a card
 * within the card-column margin.
 */
let lastSentAt = 0;
export default function handleColumnHover(columnProps, monitor) {
  const now = new Date();
  if (lastSentAt > (now - DND_THROTTLE)) {
    return;
  }
  // Don't steal drops from nested drop targets
  if (!monitor.isOver({shallow: true})) {
    return;
  }

  lastSentAt = now;

  const {area, status, queryKey} = columnProps;
  const {id} = monitor.getItem();
  const gqlArgs = {
    area,
    updatedProject: {id, status}
  };
  const op = areaOpLookup[area];
  const cashayArgs = {
    ops: {[op]: queryKey},
    variables: gqlArgs
  };
  cashay.mutate('updateProject', cashayArgs);
}
