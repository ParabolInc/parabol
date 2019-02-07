import ErrorUtils from 'fbjs/lib/ErrorUtils'
import invariant from 'fbjs/lib/invariant'
import {
  Disposable,
  HandleFieldPayload,
  HandlerProvider,
  MutableRecordSource,
  OptimisticUpdate,
  RecordSource,
  RelayResponsePayload,
  SelectorData,
  SelectorStoreUpdater,
  Store as _Store,
  StoreUpdater
} from 'relay-runtime'
import normalizeRelayPayload from 'relay-runtime/lib/normalizeRelayPayload'
import RelayInMemoryRecordSource from 'relay-runtime/lib/RelayInMemoryRecordSource'

import RelayReader from 'relay-runtime/lib/RelayReader'
import RelayRecordSourceMutator from 'relay-runtime/lib/RelayRecordSourceMutator'
import RelayRecordSourceProxy from 'relay-runtime/lib/RelayRecordSourceProxy'
import RelayRecordSourceSelectorProxy from 'relay-runtime/lib/RelayRecordSourceSelectorProxy'

interface Store extends _Store {
  holdGC: () => Disposable
}

type OperationDescriptor = any

type Payload = {
  fieldPayloads: Array<HandleFieldPayload> | null
  operation: OperationDescriptor | null
  source: MutableRecordSource
  updater?: SelectorStoreUpdater | null
}

interface ClientPayload {
  kind: 'client'
  updater: StoreUpdater
}

interface OptimisticPayload {
  kind: 'optimistic'
  updater: OptimisticUpdate
}

interface ServerPayload {
  kind: 'payload'
  payload: Payload
}

interface SourcePayload {
  kind: 'source'
  source: RecordSource
}

type DataToCommit = ClientPayload | OptimisticPayload | ServerPayload | SourcePayload

/**
 * Coordinates the concurrent modification of a `Store`
 * due to client, server, and optimistic updates
 * - Applies updates linearly
 * - Executes handlers for "handle" fields
 * - Rebases whenever an optimistic update is committed or reverted
 */

class LinearPublishQueue {
  _store: Store
  _handlerProvider: HandlerProvider | null

  // A "negative" of all applied updaters. It can be published to the store to
  // undo them in order to re-apply
  _backup: MutableRecordSource
  // The index of the most recent update applied to the backup to achieve the
  // current store state
  _currentStoreIdx: number
  // Garbage collection hold, should rerun gc on dispose
  _gcHold: Disposable | null
  // True if the next `run()` should apply the backup and rerun all updates
  // performing a rebase.
  _pendingBackupRebase: boolean
  // All the updates to be processed in order. Updates before the first
  // `optimistic` are committed. The rest are applied and logged to the backup
  // in the event of a revert.
  _pendingUpdates: Array<DataToCommit>

  constructor (store: Store, handlerProvider?: HandlerProvider | null) {
    this._backup = new RelayInMemoryRecordSource()
    this._currentStoreIdx = 0
    this._gcHold = null
    this._handlerProvider = handlerProvider || null
    this._pendingBackupRebase = false
    this._pendingUpdates = []
    this._store = store
  }

  /**
   * Schedule applying an optimistic updates on the next `run()`.
   */
  applyUpdate (updater: OptimisticUpdate): void {
    invariant(
      findUpdaterIdx(this._pendingUpdates, updater) === -1,
      'LinearPublishQueue: Cannot apply the same update function more than ' + 'once concurrently.'
    )
    this._pendingUpdates.push({kind: 'optimistic', updater})
  }

  /**
   * Schedule reverting an optimistic updates on the next `run()`.
   */
  revertUpdate (updater: OptimisticUpdate): void {
    const updateIdx = findUpdaterIdx(this._pendingUpdates, updater)
    if (updateIdx !== -1) {
      this._pendingBackupRebase = true
      this._pendingUpdates.splice(updateIdx, 1)
    }
  }

  /**
   * Schedule a revert of all optimistic updates on the next `run()`.
   */
  revertAll (): void {
    this._pendingBackupRebase = true
    this._pendingUpdates = this._pendingUpdates.filter((update) => update.kind !== 'optimistic')
  }

  /**
   * Schedule applying a payload to the store on the next `run()`.
   * If provided, this will revert the corresponding optimistic update
   */
  commitPayload (
    operation: OperationDescriptor,
    {fieldPayloads, source}: RelayResponsePayload,
    updater?: SelectorStoreUpdater | null,
    optimisticUpdate?: OptimisticUpdate | null
  ): void {
    const serverData: ServerPayload = {
      kind: 'payload',
      payload: {fieldPayloads, operation, source, updater}
    }
    if (optimisticUpdate) {
      const updateIdx = findUpdaterIdx(this._pendingUpdates, optimisticUpdate)
      if (updateIdx !== -1) {
        this._pendingBackupRebase = true
        this._pendingUpdates.splice(updateIdx, 1, serverData)
        return
      }
    }
    this._pendingUpdates.push(serverData)
  }

  commitRelayPayload ({fieldPayloads, source}: RelayResponsePayload): void {
    this._pendingBackupRebase = true
    this._pendingUpdates.push({
      kind: 'payload',
      payload: {fieldPayloads, operation: null, source, updater: null}
    })
  }

  /**
   * Schedule an updater to mutate the store on the next `run()` typically to
   * update client schema fields.
   */
  commitUpdate (updater: StoreUpdater): void {
    this._pendingUpdates.push({
      kind: 'client',
      updater
    })
  }

  /**
   * Schedule a publish to the store from the provided source on the next
   * `run()`. As an example, to update the store with substituted fields that
   * are missing in the store.
   */
  commitSource (source: RecordSource): void {
    this._pendingUpdates.push({kind: 'source', source})
  }

  /**
   * Execute all queued up operations from the other public methods.
   * There is a single queue for all updates to guarantee linearizability
   */
  run (): void {
    if (this._pendingBackupRebase) {
      this._currentStoreIdx = 0
      if (this._backup.size()) {
        this._store.publish(this._backup)
      }
    }
    this._commitPendingUpdates()
    this._applyPendingUpdates()

    this._pendingBackupRebase = false
    this._currentStoreIdx = this._pendingUpdates.length
    this._store.notify()
  }

  _applyPendingUpdates () {
    if (this._currentStoreIdx < this._pendingUpdates.length) {
      const updates = this._pendingUpdates.slice(this._currentStoreIdx)
      this._handleUpdates(updates)
      if (!this._gcHold) {
        this._gcHold = this._store.holdGC()
      }
    } else if (this._gcHold && this._pendingUpdates.length === 0) {
      this._gcHold.dispose()
      this._gcHold = null
    }
  }

  _commitPendingUpdates () {
    const firstOptimisticIdx = this._pendingUpdates.findIndex(({kind}) => kind === 'optimistic')
    const endIdx = firstOptimisticIdx === -1 ? this._pendingUpdates.length : firstOptimisticIdx
    if (endIdx > 0) {
      const updatesToCommit = this._pendingUpdates.splice(0, endIdx)
      this._handleUpdates(updatesToCommit, true)
      this._backup.clear()
    }
  }

  _handleUpdates (updates: DataToCommit[], isCommit?: boolean) {
    const sink = new RelayInMemoryRecordSource()
    const mutator = new RelayRecordSourceMutator(
      this._store.getSource(),
      sink,
      isCommit ? undefined : this._backup
    )
    const store = new RelayRecordSourceProxy(mutator, this._handlerProvider)
    for (let ii = 0; ii < updates.length; ii++) {
      const update = updates[ii]
      switch (update.kind) {
        case 'client':
          ErrorUtils.applyWithGuard(
            update.updater,
            null,
            [store],
            null,
            'LinearPublishQueue:applyUpdates'
          )
          break
        case 'optimistic':
          applyOptimisticUpdate(update.updater, store)
          break
        case 'payload':
          applyServerPayloadUpdate(update.payload, store)
          break
        case 'source':
          store.publishSource(update.source)
          break
      }
    }
    this._store.publish(sink)
  }
}

function applyOptimisticUpdate (optimisticUpdate, store) {
  if (optimisticUpdate.operation) {
    const {selectorStoreUpdater, operation, response} = optimisticUpdate

    if (response) {
      const {source, fieldPayloads} = normalizeRelayPayload(operation.root, response)
      store.publishSource(source, fieldPayloads)
      if (selectorStoreUpdater) {
        const selectorData = lookupSelector(source, operation.fragment, operation)
        const selectorStore = new RelayRecordSourceSelectorProxy(store, operation.fragment)
        ErrorUtils.applyWithGuard(
          selectorStoreUpdater,
          null,
          [selectorStore, selectorData],
          null,
          'LinearPublishQueue:applyUpdates'
        )
      }
    } else {
      const selectorStore = new RelayRecordSourceSelectorProxy(store, operation.fragment)
      ErrorUtils.applyWithGuard(
        selectorStoreUpdater,
        null,
        [selectorStore],
        null,
        'LinearPublishQueue:applyUpdates'
      )
    }
  } else if (optimisticUpdate.storeUpdater) {
    const {storeUpdater} = optimisticUpdate
    ErrorUtils.applyWithGuard(storeUpdater, null, [store], null, 'LinearPublishQueue:applyUpdates')
  } else {
    const {source, fieldPayloads} = optimisticUpdate
    store.publishSource(source, fieldPayloads)
  }
}

function applyServerPayloadUpdate (payload: Payload, store): void {
  const {fieldPayloads, operation, source, updater} = payload
  store.publishSource(source, fieldPayloads)
  if (updater) {
    const selector = operation && operation.fragment
    invariant(
      selector != null,
      'RelayModernEnvironment: Expected a selector to be provided with updater function.'
    )
    const selectorData = lookupSelector(source, selector, operation)
    const selectorStore = new RelayRecordSourceSelectorProxy(store, selector)
    updater(selectorStore, selectorData)
  }
}

function findUpdaterIdx (
  updates: Array<DataToCommit>,
  updater: StoreUpdater | OptimisticUpdate
): number {
  return updates.findIndex((update) => (update as any).updater === updater)
}

type ReaderSelector = any

function lookupSelector (
  source: RecordSource,
  selector: ReaderSelector,
  owner: OperationDescriptor | null
): SelectorData | null {
  return RelayReader.read(source, selector, owner).data
}

export default LinearPublishQueue
