import {cashay} from 'cashay';
import checkDragForUpdate from 'universal/dnd/checkDragForUpdate';
import {DND_THROTTLE} from 'universal/utils/constants';

let lastSentAt = 0;
export default function handleActionHover(targetProps, monitor) {
  const now = new Date();
  if (lastSentAt > (now - DND_THROTTLE)) return;
  const {actions, dragState, queryKey} = targetProps;
  const updatedVariables = checkDragForUpdate(monitor, dragState, actions, true);
  if (!updatedVariables) return;
  const {rebalanceDoc, updatedDoc: updatedAction} = updatedVariables;
  lastSentAt = now;
  const options = {
    ops: {userActions: queryKey},
    variables: {updatedAction}
  };
  // close it out! we know we're moving
  dragState.clear();

  cashay.mutate('updateAction', options);
  if (rebalanceDoc) {
    const rebalanceOptions = {
      ops: {userActions: queryKey},
      variables: {updatedAction: rebalanceDoc}
    };
    cashay.mutate('updateAction', rebalanceOptions);
  }
}
