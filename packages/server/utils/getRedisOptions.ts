import {readFileSync} from 'fs'
import path from 'node:path'
import getProjectRoot from '../../../scripts/webpack/utils/getProjectRoot'
import {Logger} from './Logger'

const getAbsPath = (maybeRelativePath: string) => {
  if (path.isAbsolute(maybeRelativePath)) return maybeRelativePath
  const projectRoot = getProjectRoot()
  return path.join(projectRoot, maybeRelativePath)
}

const getRedisTLS = () => {
  // optional env var, likely outside the app dir
  const {
    REDIS_TLS_CERT_FILE,
    REDIS_TLS_KEY_FILE,
    REDIS_TLS_CA_FILE,
    REDIS_TLS_REJECT_UNAUTHORIZED
  } = process.env
  let ca: string
  try {
    ca = readFileSync(getAbsPath(REDIS_TLS_CA_FILE!), 'ascii')
  } catch {
    // Some managed services use rediss:// proto, presumably they do the TLS handshake in wrappers around the app/DB
    return undefined
  }
  const rejectUnauthorized = REDIS_TLS_REJECT_UNAUTHORIZED === 'false' ? false : true
  let key: string
  let cert: string
  try {
    key = readFileSync(getAbsPath(REDIS_TLS_KEY_FILE!), 'ascii')
    cert = readFileSync(getAbsPath(REDIS_TLS_CERT_FILE!), 'ascii')
  } catch {
    return {ca, rejectUnauthorized}
  }
  return {ca, rejectUnauthorized, key, cert}
}

const getMode = (tls: ReturnType<typeof getRedisTLS>, password: string | undefined) => {
  if (password) {
    if (tls?.cert) return 'TLS + Password'
    if (tls?.ca) return 'CA + Password'
    return 'Password only'
  }
  if (tls?.cert) return 'TLS'
  if (tls?.ca) return 'CA only'
  return 'Unsecure'
}

export const getRedisOptions = () => {
  const {REDIS_PASSWORD, REDIS_URL} = process.env
  if (!REDIS_URL) throw new Error('Env Var REDIS_URL is not defined')
  const password = REDIS_PASSWORD || undefined
  const tls = getRedisTLS()
  const mode = getMode(tls, password)
  // Keep logs quiet if using default
  if (mode !== 'Unsecure') {
    Logger.log(`Redis mode: ${mode}`)
  }
  return {tls, password}
}
