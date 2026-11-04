const CLIENT_VERSION = /^[\w.+-]{1,64}$/

const parseClientVersion = (clientVersion: unknown) =>
  typeof clientVersion === 'string' && CLIENT_VERSION.test(clientVersion)
    ? clientVersion
    : undefined

export default parseClientVersion
