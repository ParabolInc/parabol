import {cashay} from 'cashay';
import {findDOMNode} from 'react-dom';
import checkDragForUpdate from 'universal/dnd/checkDragForUpdate';

export default function handleAgendaHover(targetProps, monitor) {
  const {agenda, dragState, teamId} = targetProps;
  const updatedVariables= checkDragForUpdate(monitor, dragState, agenda, 'sortOrder', false);
  if (!updatedVariables) return;
  const {updatedDoc: updatedAgendaItem} = updatedVariables;
  const options = {
    ops: {
      agendaListAndInputContainer: teamId
    },
    variables: {updatedAgendaItem}
  };
  cashay.mutate('updateAgendaItem', options);
}
