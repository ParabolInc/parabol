import type {HocuspocusProvider} from '@hocuspocus/provider'
import type * as Y from 'yjs'
import {providerManager} from '../providerManager'
import {BLOCK_MOVE_TIMEOUT_MS} from './waitForSaved'

export type TargetRefusal = 'offline' | 'readonly' | 'streaming'

export const writeToTargetPage = async <T extends object | void>(
  targetPageId: string,
  write: (frag: Y.XmlFragment, provider: HocuspocusProvider) => Promise<T>,
  {refuseWhileStreaming = true} = {}
): Promise<T | TargetRefusal> => {
  const provider = await providerManager.openSynced(targetPageId, BLOCK_MOVE_TIMEOUT_MS)
  if (!provider) return 'offline'
  try {
    if (provider.authorizedScope === 'readonly') return 'readonly'
    const frag = provider.document.getXmlFragment('default')
    if (refuseWhileStreaming && frag.querySelector('thinkingBlock')) return 'streaming'
    return await write(frag, provider)
  } finally {
    providerManager.unregister(targetPageId)
  }
}
