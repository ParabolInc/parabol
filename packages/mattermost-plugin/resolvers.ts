import {Client4} from 'mattermost-redux/client'
import {Options} from 'mattermost-redux/types/client4'
import {LiveState, suspenseSentinel} from 'relay-runtime'
import {ResolverContext} from './Atmosphere'

const fetchOnce = <T>(url: string, options: Options): LiveState<T | null> => {
  const letsGo = async () => {
    const res = await fetch(url, Client4.getOptions(options))
    const json = await res.json()
    return json
  }

  let result: T | null = null
  let pending = false
  const callbacks = new Set<() => void>()
  letsGo().then((res) => {
    result = res
    pending = false
    callbacks.forEach((cb) => cb())
  })

  return {
    read: () => {
      if (pending) {
        return suspenseSentinel()
      }
      return result
    },
    subscribe: (callback: () => void) => {
      callbacks.add(callback)
      return () => {
        callbacks.delete(callback)
      }
    }
  }
}

/**
 * @RelayResolver Config
 * @weak
 */
export type ConfigSource = {
  parabolUrl: string
}

/**
 * @RelayResolver Query.config: Config
 * @live
 */
export function config(_args: any, context: ResolverContext): LiveState<ConfigSource | null> {
  return fetchOnce(`${context.serverUrl}/config`, {
    method: 'GET'
  })
}

/**
 * @RelayResolver Config.parabolUrl: String
 * Should be unneccessary, but querying the field doesn't work otherwise
 */
export function parabolUrl(config: ConfigSource): string {
  return config.parabolUrl
}
