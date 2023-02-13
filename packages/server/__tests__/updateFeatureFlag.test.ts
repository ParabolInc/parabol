import ServerAuthToken from '../database/types/ServerAuthToken'
import encodeAuthToken from '../utils/encodeAuthToken'
import {sendPublic, signUp} from './common'

const UPDATE_FEATURE_FLAG = `
  mutation UpdateFeatureFlag($emails: [String!], $domain: String, $flag: UserFlagEnum!, $addFlag: Boolean!) {
    updateFeatureFlag(emails: $emails, domain: $domain, flag: $flag, addFlag: $addFlag) {
      error {
        title
        message
      }
      users {
        id
        featureFlags {
          azureDevOps
        }
      }
    }
  }
`

test('Add feature flag by email', async () => {
  const {email, userId} = await signUp()
  const authToken = encodeAuthToken(new ServerAuthToken())

  const update = await sendPublic({
    query: UPDATE_FEATURE_FLAG,
    variables: {
      emails: [email],
      flag: 'azureDevOps',
      addFlag: true
    },
    authToken
  })

  expect(update).toEqual({
    data: {
      updateFeatureFlag: {
        error: null,
        users: [
          {
            id: userId,
            featureFlags: {
              azureDevOps: true
            }
          }
        ]
      }
    }
  })
})

test('Remove feature flag by email', async () => {
  const {email, userId} = await signUp()
  const authToken = encodeAuthToken(new ServerAuthToken())

  const update = await sendPublic({
    query: UPDATE_FEATURE_FLAG,
    variables: {
      emails: [email],
      flag: 'azureDevOps',
      addFlag: false
    },
    authToken
  })

  expect(update).toEqual({
    data: {
      updateFeatureFlag: {
        error: null,
        users: [
          {
            id: userId,
            featureFlags: {
              azureDevOps: false
            }
          }
        ]
      }
    }
  })
})
