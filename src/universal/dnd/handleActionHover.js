import {cashay} from 'cashay';
import checkDragForUpdate from 'universal/dnd/checkDragForUpdate';
import {DND_THROTTLE, MIN_SORT_RESOLUTION} from 'universal/utils/constants';

let lastSentAt = 0;
export default function handleActionHover(targetProps, monitor) {
  const now = new Date();
  if (lastSentAt > (now - DND_THROTTLE)) return;
  const {actions, dragState, queryKey} = targetProps;
  const updatedVariables = checkDragForUpdate(monitor, dragState, actions, 'sortOrder', true);
  if (!updatedVariables) return;
  const {prevItem, updatedDoc: updatedAction} = updatedVariables;
  const variables = {updatedAction};
  if (prevItem && Math.abs(prevItem.sortOrder - updatedAction.sortOrder) < MIN_SORT_RESOLUTION) {
    variables.rebalance = true;
  }
  const options = {
    ops: {userActions: queryKey},
    variables
  };
  lastSentAt = now;
  cashay.mutate('updateAction', options);
}
