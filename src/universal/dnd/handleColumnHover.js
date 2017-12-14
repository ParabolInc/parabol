import checkDragForUpdate from 'universal/dnd/checkDragForUpdate';
import UpdateProjectMutation from 'universal/mutations/UpdateProjectMutation';
import {DND_THROTTLE} from 'universal/utils/constants';

/**
 * Assuming the whole column is a single drop target, we need to figure out where the drag source should go.
 * To do that, the monitor provides an array of components which are all the cards
 * From there, we can calculate the center Y for each card.
 * Based on the center Y and the sourceOffsetY, we can determine where the drag source currently is
 * A card has a do-nothing zone of the drag source height + 1/2 of the card above + 1/2 of the card below
 * if it exceeds that zone, we update
 *
 */

let lastSentAt = 0;
export default function handleProjectHover(targetProps, monitor) {
  const now = new Date();
  if (lastSentAt > (now - DND_THROTTLE)) return;
  const {atmosphere, dragState, projects, status: targetStatus} = targetProps;
  const sourceProps = monitor.getItem();
  const {status: sourceStatus} = sourceProps;
  if (targetStatus !== sourceStatus) {
    // we don't want the minY and minX to apply if we're hovering over another column
    dragState.handleEndDrag();
  }
  const updatedVariables = checkDragForUpdate(monitor, dragState, projects, true);
  if (!updatedVariables) return;

  // close it out! we know we're moving
  dragState.clear();

  const {rebalanceDoc, updatedDoc: updatedProject} = updatedVariables;
  if (sourceStatus !== targetStatus) {
    updatedProject.status = targetStatus;
    sourceProps.status = targetStatus;
  }
  lastSentAt = now;
  UpdateProjectMutation(atmosphere, updatedProject);
  if (rebalanceDoc) {
    // bad times. just toss the offending doc to the bottom of the column
    UpdateProjectMutation(atmosphere, rebalanceDoc);
  }
}
