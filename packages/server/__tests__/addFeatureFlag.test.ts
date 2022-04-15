import ServerAuthToken from '../database/types/ServerAuthToken'
import encodeAuthToken from '../utils/encodeAuthToken'
import {drainRethink, sendPublic, signUp} from './common'

afterAll(() => {
  return drainRethink()
})

const ADD_FEATURE_FLAG = `
  mutation AddFeatureFlag($emails: [String!], $domain: String, $flag: UserFlagEnum!) {
    addFeatureFlag(emails: $emails, domain: $domain, flag: $flag) {
      error {
        title
        message
      }
      users {
        id
        featureFlags {
          standups
        }
      }
    }
  }
`

test('Add feature flag by email', async () => {
  const {email, userId} = await signUp()
  const authToken = encodeAuthToken(new ServerAuthToken())

  const update = await sendPublic({
    query: ADD_FEATURE_FLAG,
    variables: {
      emails: [email],
      flag: 'standups'
    },
    authToken
  })

  expect(update).toEqual({
    data: {
      addFeatureFlag: {
        error: null,
        users: [
          {
            id: userId,
            featureFlags: {
              standups: true
            }
          }
        ]
      }
    }
  })
})
