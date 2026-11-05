import getRedis from '../getRedis'
import {
  consumeSAMLMetadataChangeRequest,
  createSAMLMetadataChangeRequest
} from '../samlMetadataChangeRequest'

afterAll(() => {
  getRedis().disconnect()
})

test('a metadata change request can be consumed exactly once', async () => {
  const request = {
    samlId: 'acme',
    metadataURL: 'https://idp.example.com/metadata',
    requestedBy: 'local|admin'
  }
  const id = await createSAMLMetadataChangeRequest(request)

  expect(await consumeSAMLMetadataChangeRequest(id)).toEqual(request)
  expect(await consumeSAMLMetadataChangeRequest(id)).toBeNull()
})

test('an id the server never issued resolves to nothing', async () => {
  expect(await consumeSAMLMetadataChangeRequest('not-issued-by-the-server')).toBeNull()
})
