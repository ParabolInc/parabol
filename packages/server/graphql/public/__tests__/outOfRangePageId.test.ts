import {GraphQLError, type GraphQLResolveInfo} from 'graphql'
import hash from 'object-hash'
import AuthToken from '../../../database/types/AuthToken'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../../utils/CipherId'
import requestPageAccess from '../mutations/requestPageAccess'
import {hasPageAccess} from '../rules/hasPageAccess'
import PublicRoot from '../types/PublicRoot'

afterAll(async () => {
  await getKysely().destroy()
})

const MAX_PG_INT = 2 ** 31 - 1

const findPageCode = (isMatch: (dbId: number) => boolean) => {
  for (let code = 1; code < 1_000_000; code++) {
    if (isMatch(CipherId.decrypt(code))) return `page:${code}`
  }
  throw new Error('No matching page code found')
}

// A code the client could send that decrypts past the PG integer column
const overflowPageId = findPageCode((dbId) => dbId > MAX_PG_INT)
// A well-formed code for a page that does not exist
const missingPageId = findPageCode((dbId) => dbId > 1e9 && dbId <= MAX_PG_INT)

const makeContext = () => ({
  authToken: new AuthToken({sub: 'outOfRangePageIdUser', tms: []}),
  dataLoader: getNewDataLoader('outOfRangePageId.test'),
  socketId: 'outOfRangePageIdSocket'
})

describe('CipherId.isValidDbId', () => {
  it('accepts ids that fit in a PG integer', () => {
    expect(CipherId.isValidDbId(1)).toBe(true)
    expect(CipherId.isValidDbId(MAX_PG_INT)).toBe(true)
  })

  it('rejects ids a PG integer column cannot hold', () => {
    expect(CipherId.isValidDbId(0)).toBe(false)
    expect(CipherId.isValidDbId(MAX_PG_INT + 1)).toBe(false)
    expect(CipherId.isValidDbId(0xffffffff)).toBe(false)
    expect(CipherId.isValidDbId(CipherId.fromClient(overflowPageId)[0])).toBe(false)
  })
})

describe('page id that decrypts past the PG integer range', () => {
  it('PublicRoot.page reports the page as not found', async () => {
    const context = makeContext()
    const page = PublicRoot.page as (...args: unknown[]) => Promise<unknown>
    for (const pageId of [missingPageId, overflowPageId]) {
      await expect(page({}, {pageId}, context, {})).rejects.toThrow(
        new GraphQLError('Page not found')
      )
    }
    context.dataLoader.dispose()
  })

  it('hasPageAccess denies access the same way it does for a missing page', async () => {
    const pageRule = hasPageAccess<'User.page'>('args.pageId', 'viewer')
    // match composeResolvers, where debug re-throws errors raised inside the rule
    const shieldOptions = {debug: true, hashFunction: hash} as Parameters<
      typeof pageRule.resolve
    >[4]
    for (const pageId of [missingPageId, overflowPageId]) {
      const context = {...makeContext(), _shield: {cache: {}}}
      const res = await pageRule.resolve(
        {},
        {pageId},
        context,
        {} as GraphQLResolveInfo,
        shieldOptions
      )
      expect(res).toBeInstanceOf(GraphQLError)
      expect((res as GraphQLError).message).toBe(
        'Insufficient permission. User role: None Role required: viewer'
      )
      context.dataLoader.dispose()
    }
  })

  it('requestPageAccess reports the page as not found', async () => {
    const context = makeContext()
    const mutation = requestPageAccess as (...args: unknown[]) => Promise<unknown>
    await expect(
      mutation({}, {pageId: overflowPageId, role: 'viewer'}, context, {})
    ).rejects.toThrow(new GraphQLError('Page not found'))
    context.dataLoader.dispose()
  })
})
