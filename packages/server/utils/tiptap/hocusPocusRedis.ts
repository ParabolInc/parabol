// Remove after PR gets merged: https://github.com/ueberdosis/hocuspocus/pull/958
import {
  afterLoadDocumentPayload,
  afterStoreDocumentPayload,
  beforeBroadcastStatelessPayload,
  Debugger,
  Document,
  Extension,
  Hocuspocus,
  IncomingMessage,
  MessageReceiver,
  onAwarenessUpdatePayload,
  onChangePayload,
  onConfigurePayload,
  onDisconnectPayload,
  onStoreDocumentPayload,
  OutgoingMessage
} from '@hocuspocus/server'
import {Redlock, type ExecutionResult, type Lock} from '@sesamecare-oss/redlock'
import RedisClient, {ClusterNode, ClusterOptions, RedisOptions, type Cluster} from 'ioredis'
import {v4 as uuid} from 'uuid'

export type RedisInstance = RedisClient | Cluster

export interface Configuration {
  /**
   * Redis port
   */
  port: number
  /**
   * Redis host
   */
  host: string
  /**
   * Redis Cluster
   */
  nodes?: ClusterNode[]
  /**
   * Duplicate from an existed Redis instance
   */
  redis?: RedisInstance
  /**
   * Redis instance creator
   */
  createClient?: () => RedisInstance
  /**
   * Options passed directly to Redis constructor
   *
   * https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options
   */
  options?: ClusterOptions | RedisOptions
  /**
   * An unique instance name, required to filter messages in Redis.
   * If none is provided an unique id is generated.
   */
  identifier: string
  /**
   * Namespace for Redis keys, if none is provided 'hocuspocus' is used
   */
  prefix: string
  /**
   * The maximum time for the Redis lock in ms (in case it can’t be released).
   */
  lockTimeout: number
  /**
   * A delay before onDisconnect is executed. This allows last minute updates'
   * sync messages to be received by the subscription before it's closed.
   */
  disconnectDelay: number
}

export class Redis implements Extension {
  /**
   * Make sure to give that extension a higher priority, so
   * the `onStoreDocument` hook is able to intercept the chain,
   * before documents are stored to the database.
   */
  priority = 1000

  configuration: Configuration = {
    port: 6379,
    host: '127.0.0.1',
    prefix: 'hocuspocus',
    identifier: `host-${uuid()}`,
    lockTimeout: 1000,
    disconnectDelay: 1000
  }

  redisTransactionOrigin = '__hocuspocus__redis__origin__'

  pub: RedisInstance

  sub: RedisInstance

  instance!: Hocuspocus

  redlock: Redlock

  locks = new Map<string, {lock: Lock; release?: Promise<ExecutionResult>}>()

  logger: Debugger

  messagePrefix: Buffer

  /**
   * When we have a high frequency of updates to a document we don't need tons of setTimeouts
   * piling up, so we'll track them to keep it to the most recent per document.
   */
  private pendingDisconnects = new Map<string, NodeJS.Timeout>()

  private pendingAfterStoreDocumentResolves = new Map<
    string,
    {timeout: NodeJS.Timeout; resolve: () => void}
  >()

  public constructor(configuration: Partial<Configuration>) {
    this.configuration = {
      ...this.configuration,
      ...configuration
    }

    // We’ll replace that in the onConfigure hook with the global instance.
    this.logger = new Debugger()

    // Create Redis instance
    const {port, host, options, nodes, redis, createClient} = this.configuration

    if (typeof createClient === 'function') {
      this.pub = createClient()
      this.sub = createClient()
    } else if (redis) {
      this.pub = redis.duplicate()
      this.sub = redis.duplicate()
    } else if (nodes && nodes.length > 0) {
      this.pub = new RedisClient.Cluster(nodes, options)
      this.sub = new RedisClient.Cluster(nodes, options)
    } else {
      this.pub = new RedisClient(port, host, options!)
      this.sub = new RedisClient(port, host, options!)
    }
    this.sub.on('messageBuffer', this.handleIncomingMessage)

    this.redlock = new Redlock([this.pub], {
      retryCount: 0,
      driftFactor: 0.1
    })

    const identifierBuffer = Buffer.from(this.configuration.identifier, 'utf-8')
    this.messagePrefix = Buffer.concat([Buffer.from([identifierBuffer.length]), identifierBuffer])
  }

  async onConfigure({instance}: onConfigurePayload) {
    this.logger = instance.debugger
    this.instance = instance
  }

  private getKey(documentName: string) {
    return `${this.configuration.prefix}:${documentName}`
  }

  private pubKey(documentName: string) {
    return this.getKey(documentName)
  }

  private subKey(documentName: string) {
    return this.getKey(documentName)
  }

  private lockKey(documentName: string) {
    return `${this.getKey(documentName)}:lock`
  }

  private encodeMessage(message: Uint8Array) {
    return Buffer.concat([this.messagePrefix, Buffer.from(message)])
  }

  private decodeMessage(buffer: Buffer) {
    const identifierLength = buffer[0]!
    const identifier = buffer.toString('utf-8', 1, identifierLength + 1)

    return [identifier, buffer.slice(identifierLength + 1)]
  }

  /**
   * Once a document is loaded, subscribe to the channel in Redis.
   */
  public async afterLoadDocument({documentName, document}: afterLoadDocumentPayload) {
    return new Promise((resolve, reject) => {
      // On document creation the node will connect to pub and sub channels
      // for the document.
      this.sub.subscribe(this.subKey(documentName), async (error) => {
        if (error) {
          reject(error)
          return
        }

        this.publishFirstSyncStep(documentName, document)
        this.requestAwarenessFromOtherInstances(documentName)

        resolve(undefined)
      })
    })
  }

  /**
   * Publish the first sync step through Redis.
   */
  private async publishFirstSyncStep(documentName: string, document: Document) {
    const syncMessage = new OutgoingMessage(documentName)
      .createSyncMessage()
      .writeFirstSyncStepFor(document)

    return this.pub.publish(
      this.pubKey(documentName),
      this.encodeMessage(syncMessage.toUint8Array())
    )
  }

  /**
   * Let’s ask Redis who is connected already.
   */
  private async requestAwarenessFromOtherInstances(documentName: string) {
    const awarenessMessage = new OutgoingMessage(documentName).writeQueryAwareness()

    return this.pub.publish(
      this.pubKey(documentName),
      this.encodeMessage(awarenessMessage.toUint8Array())
    )
  }

  /**
   * Before the document is stored, make sure to set a lock in Redis.
   * That’s meant to avoid conflicts with other instances trying to store the document.
   */

  async onStoreDocument({documentName}: onStoreDocumentPayload) {
    // Attempt to acquire a lock and read lastReceivedTimestamp from Redis,
    // to avoid conflict with other instances storing the same document.
    const resource = this.lockKey(documentName)
    const ttl = this.configuration.lockTimeout
    const lock = await this.redlock.acquire([resource], ttl)
    const oldLock = this.locks.get(resource)
    if (oldLock) {
      await oldLock.release
    }
    this.locks.set(resource, {lock})
  }

  /**
   * Release the Redis lock, so other instances can store documents.
   */
  async afterStoreDocument({documentName, socketId}: afterStoreDocumentPayload): Promise<void> {
    const lockKey = this.lockKey(documentName)
    const lock = this.locks.get(lockKey)
    if (!lock) {
      throw new Error(`Lock created in onStoreDocument not found in afterStoreDocument: ${lockKey}`)
    }
    try {
      // Always try to unlock and clean up the lock
      lock.release = lock.lock.release()
      await lock.release
    } catch {
      // Lock will expire on its own after timeout
    } finally {
      this.locks.delete(lockKey)
    }
    if (socketId !== 'server') return
    // if the change was initiated by a directConnection, we need to delay this hook to make sure sync can finish first.
    // for provider connections, this usually happens in the onDisconnect hook

    // Clear and resolve any previous delay
    const pending = this.pendingAfterStoreDocumentResolves.get(documentName)
    if (pending) {
      clearTimeout(pending.timeout)
      pending.resolve() // Let any pending waiter proceed early
      this.pendingAfterStoreDocumentResolves.delete(documentName)
    }

    let resolveFunction: () => void = () => {}
    const delayedPromise = new Promise<void>((resolve) => {
      resolveFunction = resolve
    })

    const timeout = setTimeout(() => {
      this.pendingAfterStoreDocumentResolves.delete(documentName)
      resolveFunction()
    }, this.configuration.disconnectDelay)

    this.pendingAfterStoreDocumentResolves.set(documentName, {timeout, resolve: resolveFunction})
    await delayedPromise
  }

  /**
   * Handle awareness update messages received directly by this Hocuspocus instance.
   */
  async onAwarenessUpdate({
    documentName,
    awareness,
    added,
    updated,
    removed
  }: onAwarenessUpdatePayload) {
    const changedClients = added.concat(updated, removed)
    const message = new OutgoingMessage(documentName).createAwarenessUpdateMessage(
      awareness,
      changedClients
    )

    return this.pub.publish(this.pubKey(documentName), this.encodeMessage(message.toUint8Array()))
  }

  /**
   * Handle incoming messages published on subscribed document channels.
   * Note that this will also include messages from ourselves as it is not possible
   * in Redis to filter these.
   */
  private handleIncomingMessage = async (_channel: Buffer, data: Buffer) => {
    const [identifier, messageBuffer] = this.decodeMessage(data)

    if (identifier === this.configuration.identifier) {
      return
    }

    const message = new IncomingMessage(messageBuffer)
    const documentName = message.readVarString()
    message.writeVarString(documentName)

    const document = this.instance.documents.get(documentName)

    if (!document) {
      // What does this mean? Why are we subscribed to this document?
      this.logger.log(`Received message for unknown document ${documentName}`)
      return
    }

    new MessageReceiver(message, this.logger, this.redisTransactionOrigin).apply(
      document,
      undefined,
      (reply) => {
        return this.pub.publish(this.pubKey(document.name), this.encodeMessage(reply))
      }
    )
  }

  /**
   * if the ydoc changed, we'll need to inform other Hocuspocus servers about it.
   */
  public async onChange(data: onChangePayload): Promise<any> {
    if (data.transactionOrigin !== this.redisTransactionOrigin) {
      return this.publishFirstSyncStep(data.documentName, data.document)
    }
  }

  /**
   * Make sure to *not* listen for further changes, when there’s
   * no one connected anymore.
   */
  public onDisconnect = async ({documentName}: onDisconnectPayload) => {
    const pending = this.pendingDisconnects.get(documentName)

    if (pending) {
      clearTimeout(pending)
      this.pendingDisconnects.delete(documentName)
    }

    const disconnect = () => {
      const document = this.instance.documents.get(documentName)

      this.pendingDisconnects.delete(documentName)

      // Do nothing, when other users are still connected to the document.
      if (!document || document.getConnectionsCount() > 0) {
        return
      }

      // Time to end the subscription on the document channel.
      this.sub.unsubscribe(this.subKey(documentName), (error: any) => {
        if (error) {
          console.error(error)
        }
      })

      this.instance.unloadDocument(document)
    }
    // Delay the disconnect procedure to allow last minute syncs to happen
    const timeout = setTimeout(disconnect, this.configuration.disconnectDelay)
    this.pendingDisconnects.set(documentName, timeout)
  }

  async beforeBroadcastStateless(data: beforeBroadcastStatelessPayload) {
    const message = new OutgoingMessage(data.documentName).writeBroadcastStateless(data.payload)

    return this.pub.publish(
      this.pubKey(data.documentName),
      this.encodeMessage(message.toUint8Array())
    )
  }

  /**
   * Kill the Redlock connection immediately.
   */
  async onDestroy() {
    await this.redlock.quit()
    this.pub.disconnect(false)
    this.sub.disconnect(false)
  }
}
