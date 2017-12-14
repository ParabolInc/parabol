import checkDragForUpdate from 'universal/dnd/checkDragForUpdate';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import UpdateAgendaItemMutation from 'universal/mutations/UpdateAgendaItemMutation';
import {AGENDA_ITEMS, DND_THROTTLE} from 'universal/utils/constants';

let lastSentAt = 0;
export default function handleAgendaHover(targetProps, monitor) {
  const now = new Date();
  if (lastSentAt > (now - DND_THROTTLE)) return;
  const {agendaPhaseItem, atmosphere, dragState, facilitatorPhase, team: {agendaItems}} = targetProps;
  // dont let current or previous items get dragged
  const {id} = monitor.getItem();
  let startedAgendaItems;
  if (facilitatorPhase) {
    startedAgendaItems = actionMeeting[facilitatorPhase].index >= actionMeeting[AGENDA_ITEMS].index;
    const currentItemIdx = startedAgendaItems ? agendaItems.findIndex((i) => i.isComplete === false) : -1;
    const dragItemIdx = agendaItems.findIndex((i) => i.id === id);
    if (dragItemIdx <= currentItemIdx) return;
  }

  const updatedVariables = checkDragForUpdate(monitor, dragState, agendaItems, false);
  if (!updatedVariables) return;
  const {updatedDoc: updatedAgendaItem} = updatedVariables;
  if (startedAgendaItems && agendaPhaseItem) {
    const currentItem = agendaItems[agendaPhaseItem - 1];
    const {sortOrder: minSort} = currentItem;
    if (updatedAgendaItem.sortOrder <= minSort) {
      return;
    }
  }

  // close it out! we know we're moving
  dragState.clear();

  lastSentAt = now;
  UpdateAgendaItemMutation(atmosphere, updatedAgendaItem);
}
