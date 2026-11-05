import {Hocuspocus, type HookName, type HookPayloadByName} from '@hocuspocus/server'
import {Logger} from '../Logger'

// Hocuspocus fires these hooks without awaiting or catching them, so a throw becomes an
// unhandled rejection that kills the process. No caller acts on their rejection, and a throw
// still skips the remaining extensions' hooks because only the end of the chain is caught.
const UNAWAITED_HOOKS = new Set<HookName>([
  'onConfigure',
  'onChange',
  'onAwarenessUpdate',
  'onStateless',
  'beforeBroadcastStateless',
  'onDisconnect',
  'afterUnloadDocument'
])

export class SafeHocuspocus<Context> extends Hocuspocus<Context> {
  hooks<T extends HookName>(
    name: T,
    payload: HookPayloadByName<Context>[T],
    callback?: Parameters<Hocuspocus<Context>['hooks']>[2]
  ) {
    const chain = super.hooks(name, payload, callback)
    if (!UNAWAITED_HOOKS.has(name)) return chain
    return chain.catch((error: unknown) => {
      Logger.error(`Hocuspocus ${name} hook failed`, error)
    })
  }
}
