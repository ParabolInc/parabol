import {fetch} from '@whatwg-node/fetch'
import {parse} from 'graphql'
import type {Executor} from 'nest-graphql-endpoint'
import toNestedRequestError from '../../../integrations/platform/toNestedRequestError'
import isExpectedError from '../../../utils/isExpectedError'
import nestGitLabEndpoint from '../nestGitLabEndpoint'
import nestLinearEndpoint from '../nestLinearEndpoint'

jest.mock('@whatwg-node/fetch', () => ({fetch: jest.fn()}))
jest.mock('nest-graphql-endpoint', () => ({
  __esModule: true,
  default: (params: {executor: unknown}) => params
}))

const endpointParams = {
  parentType: 'Parent',
  fieldName: 'api',
  resolveEndpointContext: () => ({accessToken: 'token', baseUri: 'https://example.com'}),
  schemaIDL: ''
}

test.each([
  ['GitLab', nestGitLabEndpoint],
  ['Linear', nestLinearEndpoint]
])('%s not answering in time is an expected error', async (_service, nestEndpoint) => {
  jest.mocked(fetch).mockRejectedValue(new DOMException('The operation was aborted', 'AbortError'))
  const {executor} = nestEndpoint(endpointParams) as unknown as {
    executor: Executor<{accessToken: string; baseUri: string}>
  }
  const result = await executor(parse('{ currentUser { id } }'), {}, 8000, {
    accessToken: 'token',
    baseUri: 'https://example.com'
  })
  const error = toNestedRequestError(result.errors)
  expect(error?.message).toBe('The operation was aborted')
  expect(isExpectedError(error)).toBe(true)
})
