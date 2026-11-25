import {DeleteObjectCommand, S3Client} from '@aws-sdk/client-s3'
import type {PartialPath} from '../FileStoreManager'
import S3Manager from '../S3FileStoreManager'

beforeEach(() => {
  process.env.CDN_BASE_URL = '//cdn.parabol.test/production'
  process.env.AWS_S3_BUCKET = 'test-bucket'
  process.env.AWS_REGION = 'us-east-1'
})

test('deletes the object under the key the upload was written to', async () => {
  const send = jest.spyOn(S3Client.prototype, 'send').mockImplementation(async () => ({}))
  await new S3Manager().deleteUserFile('User/local|abc/assets/a.png' as PartialPath)
  expect(send).toHaveBeenCalledTimes(1)
  const [command] = send.mock.calls[0]!
  expect(command).toBeInstanceOf(DeleteObjectCommand)
  expect(command.input).toEqual({
    Bucket: 'test-bucket',
    Key: 'production/store/User/local|abc/assets/a.png'
  })
})
