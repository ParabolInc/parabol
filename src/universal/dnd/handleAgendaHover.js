import {cashay} from 'cashay';
import checkDragForUpdate from 'universal/dnd/checkDragForUpdate';
import {DND_THROTTLE} from 'universal/utils/constants';

let lastSentAt = 0;
export default function handleAgendaHover(targetProps, monitor) {
  const now = new Date();
  if (lastSentAt > (now - DND_THROTTLE)) return;
  const {agenda, agendaPhaseItem, dragState, teamId} = targetProps;
  const updatedVariables = checkDragForUpdate(monitor, dragState, agenda, false);
  if (!updatedVariables) return;
  const {updatedDoc: updatedAgendaItem} = updatedVariables;
  if (agendaPhaseItem) {
    const currentItem = agenda[agendaPhaseItem - 1];
    const {sortOrder: minSort} = currentItem;
    // const sourceProps = monitor.getItem();
    // console.log('fd', sourceProps, minSort)

    if (updatedAgendaItem.sortOrder <= minSort) {
      // console.log('returning')
      return;
    }
  }

  // close it out! we know we're moving
  dragState.clear();

  const options = {
    ops: {
      agendaListAndInputContainer: teamId
    },
    variables: {updatedAgendaItem}
  };
  lastSentAt = now;
  cashay.mutate('updateAgendaItem', options);
}
