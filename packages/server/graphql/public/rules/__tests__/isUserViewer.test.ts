import type {GraphQLResolveInfo} from 'graphql'
import {or} from 'graphql-shield'
import AuthToken from '../../../../database/types/AuthToken'
import ServerAuthToken from '../../../../database/types/ServerAuthToken'
import logError from '../../../../utils/logError'
import isSuperUser from '../isSuperUser'
import {isUserViewer} from '../isUserViewer'

jest.mock('../../../../utils/logError')

const isUserSelf = isUserViewer<'User.id'>('source.id')
type ResolveArgs = Parameters<typeof isUserSelf.resolve>

const resolveFor = (rule: Pick<typeof isUserSelf, 'resolve'>, authToken: AuthToken) => {
  const ctx = {authToken, _shield: {cache: {}}} as unknown as ResolveArgs[2]
  const options = {hashFunction: JSON.stringify} as unknown as ResolveArgs[4]
  return rule.resolve({id: 'user-1'}, {}, ctx, {} as GraphQLResolveInfo, options)
}

test('a user is the viewer of their own User', async () => {
  expect(await resolveFor(isUserSelf, new AuthToken({sub: 'user-1', tms: []}))).toBe(true)
})

test('the server is not the viewer of a User', async () => {
  const res = await resolveFor(isUserSelf, new ServerAuthToken())
  expect(res).toBeInstanceOf(Error)
})

test("the server reads a User's fields without logging an error", async () => {
  expect(await resolveFor(or(isSuperUser, isUserSelf), new ServerAuthToken())).toBe(true)
  expect(logError).not.toHaveBeenCalled()
})
