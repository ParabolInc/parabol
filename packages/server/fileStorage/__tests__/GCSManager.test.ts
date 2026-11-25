import fetchRetryingTransientErrors from '../../utils/fetchRetryingTransientErrors'
import type {PartialPath} from '../FileStoreManager'
import GCSManager from '../GCSManager'

jest.mock('../../utils/fetchRetryingTransientErrors')

const mockedFetch = jest.mocked(fetchRetryingTransientErrors)
const partialPath = 'User/local|abc/assets/a.png' as PartialPath
const objectURL =
  'https://storage.googleapis.com/storage/v1/b/test-bucket/o/production%2Fstore%2FUser%2Flocal%7Cabc%2Fassets%2Fa.png'

beforeEach(() => {
  process.env.CDN_BASE_URL = '//cdn.parabol.test/production'
  process.env.GOOGLE_GCS_BUCKET = 'test-bucket'
  process.env.GOOGLE_CLOUD_CLIENT_EMAIL = 'store@parabol.test'
  process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID = 'key-id'
  process.env.GOOGLE_CLOUD_PRIVATE_KEY = 'not a key'
})

const respondToDelete = (status: number) =>
  mockedFetch.mockImplementation(async (_url, {method}) =>
    method === 'DELETE'
      ? new Response(status === 204 ? null : 'gone', {status})
      : Response.json({access_token: 'token'})
  )

const getDeleteCalls = () => mockedFetch.mock.calls.filter(([, {method}]) => method === 'DELETE')

test('deletes the object the upload was written to', async () => {
  respondToDelete(204)
  await new GCSManager().deleteUserFile(partialPath)
  expect(getDeleteCalls().map(([url]) => url)).toEqual([objectURL])
})

test('an object that is already gone counts as deleted', async () => {
  respondToDelete(404)
  await expect(new GCSManager().deleteUserFile(partialPath)).resolves.toBeUndefined()
})

test('a delete the store refuses throws', async () => {
  respondToDelete(403)
  await expect(new GCSManager().deleteUserFile(partialPath)).rejects.toThrow(
    'GCS Delete Error: 403'
  )
})
