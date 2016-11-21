import {columnArray} from 'universal/utils/constants';

class PrivateDragState {
  constructor() {
    this.clear();
  }
  clear() {
    for (let i = 0; i < columnArray.length; i++) {
      const status = columnArray[i];
      this.handleRender(status);
    }
  }
  handleEndDrag() {
    for (let i = 0; i < columnArray.length; i++) {
      const status = columnArray[i];
      this[status].minY = null;
      this[status].maxY = null;
    }
  }
  handleRender(status) {
    this[status] = {
      components: [],
      thresholds: [],
      minY: null,
      maxY: null
    };
  }
}

export default new PrivateDragState();
