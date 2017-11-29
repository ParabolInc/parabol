import {SORT_STEP} from 'universal/utils/constants';
import {findDOMNode} from 'react-dom';
import dndNoise from 'universal/utils/dndNoise';

export default function checkDragForUpdate(monitor, dragState, itemArray, isDescending) {
  const sourceProps = monitor.getItem();
  const {id} = sourceProps;
  const {components, minY, maxY, thresholds} = dragState;
  const {y: sourceOffsetY} = monitor.getClientOffset();
  if (minY !== null && sourceOffsetY >= minY && sourceOffsetY <= maxY) {
    return undefined;
  }
  if (thresholds.length === 0) {
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      // eslint-disable-next-line react/no-find-dom-node
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
  const updatedDoc = {id};
  const itemToReplace = itemArray[i];
  const prevItem = itemArray[i - 1];
  const dFactor = isDescending ? 1 : -1;
  let rebalanceDoc;
  if (thresholds.length === 0) {
    // console.log('no thresholds, setting to first in the column');
    updatedDoc.sortOrder = 0;
  } else if (i === 0) {
    // if we're trying to put it at the top, make sure it's not already at the top
    if (itemToReplace.id === id) {
      // console.log('best place is where it is, at the top. setting min and max Y')
      // don't listen to any upwards movement, we'll still be on top
      dragState.minY = -1;
      // if there is a second card, start listening if we're halfway down it. otherwise, never listen to downward movement
      dragState.maxY = thresholds.length > 1 ? thresholds[1] + 1 : 10e6;
      return undefined;
    }
    // console.log('setting', id,  'to first in the column behind', itemToReplace);
    updatedDoc.sortOrder = itemToReplace.sortOrder + (SORT_STEP * dFactor + dndNoise());
  } else if (i === thresholds.length) {
    // console.log('putting card at the end')
    // if we wanna put it at the end, make sure it's not already at the end
    if (prevItem.id === id) {
      // console.log('best place is where it is (at the bottom), setting min and max Y')
      // only listen to upward movement starting halfway up the card above it
      dragState.minY = thresholds[i - 1] - 1;
      // don't listen to downward movement. we're on the bottom & that ain't changing
      dragState.maxY = thresholds.length > i + 1 ? thresholds[i + 1] + 1 : 10e6;
      return undefined;
    }
    // console.log('setting to last in the column after', prevItem);
    updatedDoc.sortOrder = prevItem.sortOrder - (SORT_STEP * dFactor + dndNoise());
  } else {
    // console.log('putting card in the middle')
    // if we're somewhere in the middle, make sure we're actually gonna move
    if (itemToReplace.id === id || prevItem.id === id) {
      // only listen to upward movement starting halfway up the card above it
      dragState.minY = thresholds[i - 1] - 1;
      // start listening if we're halfway down the card below
      dragState.maxY = thresholds[i] + 1;
      // console.log('cannot assign to middle, setting min max', dragState.minY, dragState.maxY)
      return undefined;
    }
    // console.log('setting', id,  'in between', prevItem.id, itemToReplace.id);
    // if 2 users drag a task to slot 3 in a column on their user dash at the same time,
    // it's possible they have the same val, so we want it close to .5 to avoid rebalances, but with some noise
    const [minVal, maxVal] = [prevItem.sortOrder, itemToReplace.sortOrder].sort();
    const yahtzee = (Math.random() + Math.random()) / 2;
    const range = maxVal - minVal;
    const newSortOrder = minVal + yahtzee * range;
    if (newSortOrder === prevItem.sortOrder) {
      rebalanceDoc = {
        id: prevItem.id,
        sortOrder: 0
      };
    } else if (newSortOrder === itemToReplace.sortOrder) {
      rebalanceDoc = {
        id: itemToReplace.id,
        sortOrder: 0
      };
    }
    updatedDoc.sortOrder = newSortOrder;
    // console.log('new sort', updatedDoc.sortOrder, 'in between', prevItem.sortOrder, itemToReplace.sortOrder)
  }
  // mutative for fast response
  sourceProps.sortOrder = updatedDoc.sortOrder;

  return {
    rebalanceDoc,
    updatedDoc
  };
}
