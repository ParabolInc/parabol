import type {GraphQLResolveInfo} from 'graphql'
import type {ShieldRule} from '../../../composeResolvers'
import permissionMap from '../../permissions'

jest.mock('../../../../appOrigin', () => ({__esModule: true, default: 'https://parabol.test'}))

const VIEWER_ID = 'local|viewer'
const FIRST_URL = `https://parabol.test/assets/User/${VIEWER_ID}/assets/first.png`
const SECOND_URL = `https://parabol.test/assets/User/${VIEWER_ID}/assets/second.png`

type ResolveArgs = Parameters<ShieldRule['resolve']>

const resolveDeletes = async (urls: string[]) => {
  const log = jest.fn(() => ({lastMinute: 1, lastHour: 1}))
  const context = {
    authToken: {sub: VIEWER_ID},
    rateLimiter: {log},
    ip: '127.0.0.1',
    _shield: {cache: {}}
  } as unknown as ResolveArgs[2]
  const options = {hashFunction: JSON.stringify} as unknown as ResolveArgs[4]
  const rule = (permissionMap.Mutation as Record<string, ShieldRule>).deleteUserAsset!
  const results = []
  for (const url of urls) {
    results.push(
      await rule.resolve(
        {},
        {url},
        context,
        {fieldName: 'deleteUserAsset'} as GraphQLResolveInfo,
        options
      )
    )
  }
  return {results, log}
}

test('every aliased delete in one request is counted against the rate limit', async () => {
  const {results, log} = await resolveDeletes([FIRST_URL, SECOND_URL])
  expect(results).toEqual([true, true])
  expect(log).toHaveBeenCalledTimes(2)
})

test('a single delete is counted once', async () => {
  const {log} = await resolveDeletes([FIRST_URL])
  expect(log).toHaveBeenCalledTimes(1)
})
