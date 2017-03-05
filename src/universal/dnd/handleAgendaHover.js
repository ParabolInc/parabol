import {cashay} from 'cashay';
import checkDragForUpdate from 'universal/dnd/checkDragForUpdate';
import {DND_THROTTLE} from 'universal/utils/constants';

let lastSentAt = 0;
export default function handleAgendaHover(targetProps, monitor) {
  const now = new Date();
  if (lastSentAt > (now - DND_THROTTLE)) return;
  const {agenda, dragState, teamId} = targetProps;
  const updatedVariables = checkDragForUpdate(monitor, dragState, agenda, false);
  if (!updatedVariables) return;
  const {updatedDoc: updatedAgendaItem} = updatedVariables;
  const options = {
    ops: {
      agendaListAndInputContainer: teamId
    },
    variables: {updatedAgendaItem}
  };
  lastSentAt = now;
  cashay.mutate('updateAgendaItem', options);
}
