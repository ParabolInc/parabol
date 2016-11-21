import {cashay} from 'cashay';
import {SORT_STEP} from 'universal/utils/constants';
import {findDOMNode} from 'react-dom';

export default function handleColumnHoverFactory(targetProps, monitor) {
  const {agenda, teamId} = targetProps;
  const sourceProps = monitor.getItem();
  const {dragState, id} = sourceProps;
  const {components, minY, maxY, thresholds} = dragState;
  const {y: sourceOffsetY} = monitor.getClientOffset();
  if (minY !== null && sourceOffsetY >= minY && sourceOffsetY <= maxY) {
    return;
  }
  if (thresholds.length === 0) {
    // console.log('no thresholds, computing new ones from components', components);
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      const node = findDOMNode(component);
      const {top, height} = node.getBoundingClientRect();
      thresholds[i] = top + height / 2;
    }
  }

  // console.log('finding the best threshold', thresholds, sourceOffsetY);
  let i;
  for (i = 0; i < thresholds.length; i++) {
    const centerY = thresholds[i];
    if (sourceOffsetY < centerY) {
      // console.log('found a good threshold', i, thresholds[i]);
      break;
    }
  }
  const updatedAgendaItem = {id};
  const itemToReplace = agenda[i];
  const prevItem = agenda[i - 1];
  // for ASCENDING ONLY
  if (thresholds.length === 0) {
    // console.log('no thresholds, setting to first in the column');
    updatedAgendaItem.sortOrder = 0;
  } else if (i === 0) {
    // if we're trying to put it at the top, make sure it's not already at the top
    if (itemToReplace.id === id) {
      // console.log('best place is where it is, at the top. setting min and max Y')
      // don't listen to any upwards movement, we'll still be on top
      dragState.minY = -1;
      // if there is a second card, start listening if we're halfway down it. otherwise, never listen to downward movement
      dragState.maxY = thresholds.length > 1 ? thresholds[1] + 1 : 10e6;
      return;
    }
    // console.log('setting', id,  'to first in the column behind', itemToReplace);
    updatedAgendaItem.sortOrder = itemToReplace.sortOrder - SORT_STEP;
  } else if (i === thresholds.length) {
    // console.log('putting card at the end')
    // if we wanna put it at the end, make sure it's not already at the end
    if (prevItem.id === id) {
      // console.log('best place is where it is (at the bottom), setting min and max Y')
      // only listen to upward movement starting halfway up the card above it
      dragState.minY = thresholds[i - 1] - 1;
      // don't listen to downward movement. we're on the bottom & that ain't changing
      dragState.maxY = thresholds.length > i + 1 ? thresholds[i + 1] + 1 : 10e6;
      return;
    }
    // console.log('setting to last in the column after', prevItem);
    updatedAgendaItem.sortOrder = prevItem.sortOrder + SORT_STEP;
  } else {
    // console.log('putting card in the middle')
    // if we're somewhere in the middle, make sure we're actually gonna move
    if (itemToReplace.id === id || prevItem.id === id) {
      // only listen to upward movement starting halfway up the card above it
      dragState.minY = thresholds[i - 1] - 1;
      // start listening if we're halfway down the card below
      dragState.maxY = thresholds[i] + 1;
      // console.log('cannot assign to middle, setting min max', dragState.minY, dragState.maxY)
      return;
    }
    // console.log('setting', id,  'in between', prevItem.id, itemToReplace.id);
    updatedAgendaItem.sortOrder = (prevItem.sortOrder + itemToReplace.sortOrder) / 2;
    // console.log('new sort', updatedAgendaItem.sortOrder, 'in between', prevItem.sortOrder, itemToReplace.sortOrder)
  }
  // mutative for fast response
  sourceProps.sortOrder = updatedAgendaItem.sortOrder;

  const options = {
    ops: {
      agendaListAndInputContainer: teamId
    },
    variables: {updatedAgendaItem}
  };
  // TODO, do we really need to rebalance agenda items?
  // if (prevItem && prevItem.sortOrder - updatedAgendaItem.sortOrder < MIN_SORT_RESOLUTION) {
  //   options.variables.rebalance = true
  // }

  // reset the drag state now that we've moved the card
  // // console.log('why bad', sourceProps, targetProps, dragState.toString());
  // console.log('clearing drag state and sending to cashay', id, updatedAgendaItem.sortOrder);
  dragState.clear();
  cashay.mutate('updateAgendaItem', options);
}
