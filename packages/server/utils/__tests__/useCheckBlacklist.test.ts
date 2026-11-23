import {getBlacklistJWTKey, getBlacklistJWTSessionKey} from '../getBlacklistJWTKey'
import {useCheckBlacklist} from '../useCheckBlacklist'

const mockRedisValues = new Map<string, string>()
jest.mock('../getRedis', () => ({
  __esModule: true,
  default: () => ({
    mget: async (...keys: string[]) => keys.map((key) => mockRedisValues.get(key) ?? null)
  })
}))

const userId = 'blacklistUser'
const jti = 'session1'
const iat = 1_000_000

const checkToken = async (socketId?: string) => {
  const contextValue = {authToken: {sub: userId, iat, jti}, socketId}
  const {onExecute} = useCheckBlacklist() as {
    onExecute: (payload: {args: {contextValue: typeof contextValue}}) => Promise<void>
  }
  await onExecute({args: {contextValue}})
  return contextValue.authToken
}

beforeEach(() => {
  mockRedisValues.clear()
})

test('a socket keeps a token whose session another tab refreshed', async () => {
  mockRedisValues.set(getBlacklistJWTSessionKey(jti), 'refreshed:1000000500')
  expect(await checkToken('socket1')).toEqual({sub: userId, iat, jti})
})

test('an HTTP request with a token whose session was refreshed is signed out', async () => {
  mockRedisValues.set(getBlacklistJWTSessionKey(jti), 'refreshed:1000000500')
  expect(await checkToken()).toBeNull()
})

test('a socket is signed out when its session signs out', async () => {
  mockRedisValues.set(getBlacklistJWTSessionKey(jti), '1')
  expect(await checkToken('socket1')).toBeNull()
})

test('a socket is signed out when every session of its user is ended', async () => {
  mockRedisValues.set(getBlacklistJWTKey(userId), String(iat + 1))
  expect(await checkToken('socket1')).toBeNull()
})

test('a token nothing ended stays signed in', async () => {
  expect(await checkToken()).toEqual({sub: userId, iat, jti})
})
