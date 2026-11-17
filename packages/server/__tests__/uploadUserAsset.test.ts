import {MAX_FILE_SIZE_PAID} from 'parabol-client/utils/constants'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

test('a paid user can upload a file of the maximum allowed size', async () => {
  const {userId, orgId, cookie} = await signUp()
  await getKysely()
    .updateTable('Organization')
    .set({tier: 'team'})
    .where('id', '=', orgId)
    .execute()

  const res = await sendPublic({
    query: `
      mutation UploadUserAssetMutation($file: File!, $scope: AssetScopeEnum!, $scopeKey: ID!) {
        uploadUserAsset(file: $file, scope: $scope, scopeKey: $scopeKey) {
          ... on ErrorPayload {
            error {
              message
            }
          }
          ... on UploadUserAssetSuccess {
            size
          }
        }
      }
    `,
    variables: {file: null, scope: 'User', scopeKey: userId},
    uploadables: {
      file: new File([Buffer.alloc(MAX_FILE_SIZE_PAID, 'a')], 'notes.txt', {type: 'text/plain'})
    },
    cookie
  })

  expect(res.errors).toBeUndefined()
  expect(res.data).toEqual({uploadUserAsset: {size: MAX_FILE_SIZE_PAID}})
})
