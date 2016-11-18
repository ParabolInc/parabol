import {columnArray} from './constants';

export default class PrivateDragState {
  constructor() {
    this.clear();
  }
  clear(status) {
    const statusArray = status ? [status] : columnArray;
    for (let i = 0; i < statusArray.length; i++) {
      const status = statusArray[i];
      this[status] = {
        components: this[status] && this[status].components || [],
        thresholds: [],
        minY: null,
        maxY: null
      };
    }
  }
}
