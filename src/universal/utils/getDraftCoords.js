import {getVisibleSelectionRect} from 'draft-js';

const getDraftCoords = () => {
  return getVisibleSelectionRect(window);
};

export default getDraftCoords;
