import {cashay} from 'cashay';
import {SORT_STEP} from 'universal/utils/constants';
import {findDOMNode} from 'react-dom';

/**
 * Assuming the whole column is a single drop target, we need to figure out where the drag source should go.
 * To do that, the monitor provides an array of components which are all the cards
 * From there, we can calculate the center Y for each card.
 * Based on the center Y and the sourceOffsetY, we can determine where the drag source currently is
 * A card has a do-nothing zone of the drag source height + 1/2 of the card above + 1/2 of the card below
 * if it exceeds that zone, we update
 *
*/
export default function handleColumnHover(targetProps, monitor) {
  const {projects, status: targetStatus} = targetProps;
  const sourceProps = monitor.getItem();
  const {dragState, id, status: sourceStatus} = sourceProps;
  const {components, minY, maxY, thresholds} = dragState[targetStatus];
  const {y: sourceOffsetY} = monitor.getClientOffset();
  // keep it cheap by only doing work when we know it will result in a change
  if (minY !== null && sourceOffsetY >= minY && sourceOffsetY <= maxY) {
    console.log('will not update until outside bounds of', minY, maxY, 'at', sourceOffsetY);
    return;
  }
  console.log('project order', projects.map(p => p.id));
  // establish an object full of centerY thresholds. When the thresh gets exceeded, we know where to drop the target
  if (thresholds.length === 0) {
    console.log('no thresholds, computing new ones from components', components);
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      const node = findDOMNode(component);
      const {top, height} = node.getBoundingClientRect();
      thresholds[i] = top + height / 2;
    }
  }

  console.log('finding the best threshold', thresholds, sourceOffsetY);
  let i;
  for (i = 0; i < thresholds.length; i++) {
    const centerY = thresholds[i];
    if (sourceOffsetY < centerY) {
      console.log('found a good threshold', i, thresholds[i]);
      break;
    }
  }
  const updatedProject = {id};
  const projectToReplace = projects[i];
  const prevProject = projects[i-1];

  // for DESCENDING ONLY
  if (thresholds.length === 0) {
    console.log('no thresholds, setting to first in the column');
    updatedProject.teamSort = 0;
  } else if (i === 0) {
    // if we're trying to put it at the top, make sure it's not already at the top
    if (projectToReplace.id === id) {
      console.log('best place is where it is, at the top. setting min and max Y')
      // don't listen to any upwards movement, we'll still be on top
      dragState[targetStatus].minY = -1;
      // if there is a second card, start listening if we're halfway down it. otherwise, never listen to downward movement
      dragState[targetStatus].maxY = thresholds.length > 1 ? thresholds[1] + 1 : 10e6;
      return;
    }
    console.log('setting', id,  'to first in the column behind', projectToReplace);
    updatedProject.teamSort = projectToReplace.teamSort + SORT_STEP;
  } else if (i === thresholds.length) {
    console.log('putting card at the end')
    // if we wanna put it at the end, make sure it's not already at the end
    if (prevProject.id === id) {
      console.log('best place is where it is (at the bottom), setting min and max Y')
      // only listen to upward movement starting halfway up the card above it
      dragState[targetStatus].minY = thresholds[i-1] - 1;
      // don't listen to downward movement. we're on the bottom & that ain't changing
      dragState[targetStatus].maxY = thresholds.length > i + 1  ? thresholds[i+1] + 1 : 10e6;
      return;
    }
    console.log('setting to last in the column after', prevProject);
    updatedProject.teamSort = prevProject.teamSort - SORT_STEP;
  } else {
    console.log('putting card in the middle')
    // if we're somewhere in the middle, make sure we're actually gonna move
    if (projectToReplace.id === id || prevProject.id === id) {
      // only listen to upward movement starting halfway up the card above it
      dragState[targetStatus].minY = thresholds[i - 1] - 1;
      // start listening if we're halfway down the card below
      dragState[targetStatus].maxY = thresholds[i] + 1;
      console.log('cannot assign to middle, setting min max', dragState[targetStatus].minY, dragState[targetStatus].maxY)
      return;
    }
    console.log('setting', id,  'in between', prevProject.id, projectToReplace.id);
    updatedProject.teamSort = (prevProject.teamSort + projectToReplace.teamSort) / 2;
    console.log('new sort', updatedProject.teamSort, 'in between', prevProject.teamSort, projectToReplace.teamSort)
  }
  // mutative for fast response
  sourceProps.teamSort = updatedProject.teamSort;

  if (targetStatus !== sourceStatus) {
    console.log('changing status', sourceStatus, targetStatus);
    updatedProject.status = targetStatus;
    // mutative
    sourceProps.status = targetStatus;
  }
  const [teamId] = id.split('::');
  const options = {
    ops: {
      teamColumnsContainer: teamId,
    },
    variables: {updatedProject}
  };
  // reset the drag state now that we've moved the card
  // console.log('why bad', sourceProps, targetProps, dragState.toString());
  console.log('clearing drag state and sending to cashay', id, updatedProject.teamSort);
  dragState.clear();
  cashay.mutate('updateProject', options);
}
