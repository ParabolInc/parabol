import compareVersions from './compareVersions'

let connectedServerVersion: string | undefined
const listeners = new Set<() => void>()

export const setConnectedServerVersion = (version: string) => {
  connectedServerVersion = version
  listeners.forEach((listener) => listener())
}

export const onConnectedServerVersion = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// During a rolling deploy a page of the new build can reach a server of the old one, so only a newer server counts
export const isClientOutdated = () =>
  !!connectedServerVersion && compareVersions(__APP_VERSION__, connectedServerVersion) < 0
