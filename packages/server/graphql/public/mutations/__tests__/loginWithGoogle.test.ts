import {gaxios} from 'google-auth-library'
import {GraphQLError, type GraphQLResolveInfo} from 'graphql'
import isExpectedError from '../../../../utils/isExpectedError'
import type {GQLContext} from '../../../graphql'
import loginWithGoogle from '../loginWithGoogle'

const tokenEndpoint = jest.fn<Promise<Response>, Parameters<typeof fetch>>()
const request = gaxios.Gaxios.prototype.request

beforeAll(() => {
  jest.spyOn(gaxios.Gaxios.prototype, 'request').mockImplementation(function (
    this: gaxios.Gaxios,
    opts
  ) {
    return request.call(this, {...opts, retry: false, fetchImplementation: tokenEndpoint})
  })
})

afterAll(() => {
  jest.restoreAllMocks()
})

const answerOAuth2Error = (status: number, error: string, description: string) =>
  tokenEndpoint.mockResolvedValue(
    new Response(JSON.stringify({error, error_description: description}), {
      status,
      headers: {'content-type': 'application/json'}
    })
  )

const info = {} as GraphQLResolveInfo
const resolve = loginWithGoogle
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

const login = () => {
  const context = {dataLoader: {get: jest.fn()}} as unknown as GQLContext
  const result = resolve(
    {},
    {code: '4/0made-up-code', invitationToken: '', params: ''},
    context,
    info
  )
  return {context, result}
}

test.each([
  ['invalid_grant', 'Bad Request'],
  ['access_denied', 'access_denied']
])(
  'asks the user to sign in again when Google refuses the authorization code with %s',
  async (code, description) => {
    answerOAuth2Error(400, code, description)
    const {context, result} = login()
    const error = await Promise.resolve(result).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(GraphQLError)
    expect(error).toMatchObject({
      message: 'Google did not accept this sign-in. Please sign in again',
      extensions: {code: 'UNAUTHENTICATED'}
    })
    expect(isExpectedError(error)).toBe(true)
    expect(context.authToken).toBeUndefined()
    expect(context.dataLoader.get).not.toHaveBeenCalled()
  }
)

test('a token endpoint refusing our client stays an unexpected error', async () => {
  answerOAuth2Error(401, 'invalid_client', 'Unauthorized')
  const {result} = login()
  const error = await Promise.resolve(result).catch((e: unknown) => e)
  expect(error).not.toBeInstanceOf(GraphQLError)
  expect(error).toMatchObject({message: 'Unauthorized', code: 'invalid_client'})
})
