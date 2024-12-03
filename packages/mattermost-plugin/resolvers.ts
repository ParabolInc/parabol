import {Client4, Options} from "mattermost-redux/client";
import {LiveState, suspenseSentinel} from "relay-runtime";

/**
 * @RelayResolver Query.greeting: String
 */
export function greeting(): string {
  return "Hello World";
}

const fetchOnce = <T>(url: string, options: Options): LiveState<T> => {
  const letsGo = async () => {
    const res = await fetch(url, Client4.getOptions(options))
    const json = await res.json()
    return json
  }

  let result: T | null = null
  const callbacks = new Set<() => void>()
  letsGo().then((res) => {
    result = res
    callbacks.forEach((cb) => cb())
  })

  return {
    read: () => {
      if (!result) {
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
export function config(_args: any, context): LiveState<ConfigSource> {
  return fetchOnce(`${context.serverUrl}/config`, {
    method: 'GET',
  })
}

/**
 * @RelayResolver Config.parabolUrl: String
 */
export function parabolUrl(config: ConfigSource): string {
  return config.parabolUrl
}
