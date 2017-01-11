export default class DragState {
  constructor() {
    this.clear();
  }
  clear() {
    this.components = [];
    this.thresholds = [];
    this.handleEndDrag();
  }
  handleEndDrag() {
    this.minY = null;
    this.maxY = null;
  }
}
