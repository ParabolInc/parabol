import type {GraphQLResolveInfo} from 'graphql'
import AuthToken from '../../../../database/types/AuthToken'
import checkBlacklistJWT from '../../../../utils/checkBlacklistJWT'
import getRedis from '../../../../utils/getRedis'
import type {GQLContext} from '../../../graphql'
import refreshSession from '../refreshSession'

const userId = 'refreshSessionUser'
const info = {} as GraphQLResolveInfo
const resolve = refreshSession
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

const refresh = async (authToken: AuthToken, teamIds: string[], userRol: 'su' | null = null) => {
  const setCookie = jest.fn()
  const loaded = {users: {id: userId, rol: userRol}, teamIdsByUserId: teamIds}
  const context = {
    authToken,
    request: {cookieStore: {set: setCookie}},
    dataLoader: {get: (name: keyof typeof loaded) => ({load: async () => loaded[name]})}
  } as unknown as GQLContext
  await resolve({}, {}, context, info)
  return {nextAuthToken: context.authToken, setCookie}
}

afterAll(async () => {
  await getRedis().quit()
})

test('a token that already lists the viewer’s teams stays valid, because other tabs share it', async () => {
  const authToken = new AuthToken({sub: userId, tms: ['team2', 'team1']})
  const {nextAuthToken, setCookie} = await refresh(authToken, ['team1', 'team2'])
  expect(await checkBlacklistJWT(authToken)).toBe(false)
  expect(nextAuthToken).toBe(authToken)
  expect(setCookie).not.toHaveBeenCalled()
})

test('a token missing a team the viewer joined is revoked and replaced', async () => {
  const authToken = new AuthToken({sub: userId, tms: ['team1']})
  const {nextAuthToken, setCookie} = await refresh(authToken, ['team1', 'team2'])
  expect(await checkBlacklistJWT(authToken)).toBe(true)
  expect(nextAuthToken!.tms).toEqual(['team1', 'team2'])
  expect(nextAuthToken!.jti).not.toBe(authToken.jti)
  expect(setCookie).toHaveBeenCalled()
})

test('a token listing a team the viewer left is revoked and replaced', async () => {
  const authToken = new AuthToken({sub: userId, tms: ['team1', 'team2']})
  const {nextAuthToken, setCookie} = await refresh(authToken, ['team1'])
  expect(await checkBlacklistJWT(authToken)).toBe(true)
  expect(nextAuthToken!.tms).toEqual(['team1'])
  expect(setCookie).toHaveBeenCalled()
})

test('a token whose role the viewer lost is revoked and replaced', async () => {
  const authToken = new AuthToken({sub: userId, tms: ['team1'], rol: 'su'})
  const {nextAuthToken, setCookie} = await refresh(authToken, ['team1'])
  expect(await checkBlacklistJWT(authToken)).toBe(true)
  expect(nextAuthToken!.rol).toBeNull()
  expect(setCookie).toHaveBeenCalled()
})
