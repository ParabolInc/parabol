let connectedServerVersion: string | undefined

// the version the socket's server announced, which is the code sending this client its subscription payloads
export const setConnectedServerVersion = (version: string) => {
  connectedServerVersion = version
}

export const getConnectedServerVersion = () => connectedServerVersion
