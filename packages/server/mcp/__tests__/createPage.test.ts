import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import {ResourceGrants} from '../../graphql/public/ResourceGrants'
import runGraphQL from '../runGraphQL'
import createPage from '../tools/createPage'

jest.mock('../runGraphQL', () => ({__esModule: true, default: jest.fn()}))

test('a page made before its content failed comes back with its pageId', async () => {
  const dataLoader = getNewDataLoader('createPage.test')
  jest
    .mocked(runGraphQL)
    .mockResolvedValueOnce({data: {createPage: {page: {id: 'page:7'}}}})
    .mockResolvedValueOnce({errors: [{message: 'Content failed', extensions: {code: 'INTERNAL'}}]})
  const result = await createPage.run(
    {
      authorization: 'Bearer token',
      ip: '127.0.0.1',
      grant: {
        userId: 'user',
        scopes: ['pages:write'],
        aud: 'action-pat',
        resourceGrants: new ResourceGrants('user', null, null, null, dataLoader)
      }
    },
    {title: 'Notes', markdown: 'Body', teamId: 'team'}
  )
  dataLoader.dispose()
  expect(result.isError).toBe(true)
  expect(JSON.parse((result.content[0] as {text: string}).text)).toEqual([
    {message: 'Content failed', code: 'INTERNAL', pageId: 'page:7'}
  ])
})
