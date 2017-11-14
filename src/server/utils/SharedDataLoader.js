import shortid from 'shortid';

const MAX_INT = 2147483647;
const defaultExtensionNames = {
  share: 'share'
};

export default class sharedDataLoader {
  constructor(options = {}) {
    const {ttl, PROD, ...extensionNames} = options;
    this.extensionNames = {
      ...defaultExtensionNames,
      ...extensionNames
    };
    if (isNaN(Number(ttl)) || ttl <= 0 || ttl > MAX_INT) {
      throw new Error(`ttl must be positive and no greater than ${MAX_INT}`);
    }
    this.PROD = PROD;
    this._ttl = ttl;
    this.warehouse = {};
    this.warehouseLookup = {};
  }

  _dispose = (operationId) => {
    delete this.warehouse[operationId];
    delete this.warehouseLookup[operationId];
  };

  _extendDataLoader = (operationId, dataloader) => {
    /*
     * A method to dispose of any unshared dataloader
     * If you'd like to dispose of shared dataloaders, set force to `true`
     */
    dataloader.dispose = (options) => {
      const {force} = options;
      if (force) {
        this._dispose(operationId);
      } else {
        const store = this._getStore(operationId);
        // check for store so we don't bork the app in production
        if (store && !store.shared) {
          this._dispose(operationId);
        }
      }
    };

    /*
     * The getter for the operationId
     */
    dataloader.id = () => operationId;

    /*
     * Sharing should do 2 things:
     * 1. A dataloader-specific sanitization (ie remove authToken), as defined by options.share
     * 2. Establish a TTL on the shared component, since it won't be cleaned up otherwise
     *
     */
    dataloader.share = () => {
      const store = this._getStore(operationId);
      const shareName = this.extensionNames.share;
      store.dataloader[shareName]();
      setTimeout(this._dispose, this._ttl, operationId);
      store.shared = true;
    };

    /*
     * By default, we use the operationId. When this is called, it points to another operationId.
     */
    dataloader.useShared = (mutationOpId) => {
      if (!this.PROD) {
        const mutationStore = this._getStore(mutationOpId);
        if (!mutationStore.shared) {
          throw new Error('Invalid access to unshared dataloader. First call getDataLoader().share() in your mutation.');
        }
      }
      this.warehouseLookup[operationId] = mutationOpId;
    };
  };

  _getStore(operationId) {
    const store = this.warehouse[operationId];
    if (!store && !this.PROD) {
      throw new Error('Dataloader not found! Perhaps you disposed early or your ttl is too short?');
    }
    return store;
  }

  add(dataloader) {
    const operationId = shortid.generate();
    this._extendDataLoader(operationId, dataloader);
    this.warehouse[operationId] = {
      dataloader,
      shared: false
    };

    /*
     * The operationId could be a subscriptionId or mutationId
     * If it's a subscriptionId, see if there's a lookup for it & use that
     * Otherwise, use the standard as a default
     *
     */
    return () => {
      const lookupId = this.warehouseLookup[operationId];
      const storeId = lookupId || operationId;
      const store = this._getStore(storeId);
      return store.dataloader;
    };
  }
}
