const defaultShare = (dataloader) => {
  dataloader._share();
};
const DEFAULT_TTL = 5000;

export default class SharedDataLoader {
  constructor(options = {}) {
    this._share = options.share || defaultShare;
    this._ttl = options.ttl || DEFAULT_TTL;
    this.warehouse = {};
    this.warehouseLookup = {};
  }

  _dispose = (operationId) => {
    delete this.warehouse[operationId];
    delete this.warehouseLookup[operationId];
  }

  _getStore(operationId) {
    const store = this.warehouse[operationId];
    if (!store) {
      throw new Error('Dataloader not found!');
    }
    return store;
  }

  add(operationId, dataloader) {
    this.warehouse[operationId] = {
      dataloader,
      shared: false
    };
  }

  dispose(operationId, options = {}) {
    const {force} = options;
    if (force) {
      this._dispose(operationId);
    } else {
      const store = this._getStore(operationId);
      if (!store.shared) {
        this._dispose(operationId);
      }
    }
  }

  /*
   * The operationId could be a subscriptionId or mutationId
   * If it's a subscriptionId, see if there's a lookup for it & use that
   * Otherwise, use the standard as a default
   *
   */
  get(operationId) {
    const lookupId = this.warehouseLookup[operationId];
    const storeId = lookupId || operationId;
    const store = this._getStore(storeId);
    return store.dataloader;
  }

  /*
   * Sharing should do 2 things:
   * 1. A dataloader-specific sanitization (ie remove authToken), as defined by options.share
   * 2. Establish a TTL on the shared component, since it won't be cleaned up otherwise
   *
   */
  share(operationId) {
    const store = this._getStore(operationId);
    this._share(store.dataloader);
    setTimeout(this._dispose, this._ttl, operationId);
    store.shared = true;
  }

  /*
   * By default, we use the operationId. When this is called, it points to another operationId.
   */
  useShared(subscriptionOpId, mutationOpId) {
    this.warehouseLookup[subscriptionOpId] = mutationOpId;
  }
}
