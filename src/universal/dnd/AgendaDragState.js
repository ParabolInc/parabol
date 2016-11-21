class AgendaDragState {
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

export default new AgendaDragState();
