import {getUserOrgs, sendIntranet, signUp} from './common'

const APPLY_FEATURE_FLAG = `
  mutation ApplyFeatureFlag($flagName: String!, $subjects: SubjectsInput!) {
    applyFeatureFlag(flagName: $flagName, subjects: $subjects) {
      __typename
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on ApplyFeatureFlagSuccess {
        organizations {
          id
        }
      }
    }
  }
`

test('Apply feature flag to an organization', async () => {
  const {userId} = await signUp()
  const orgId = (await getUserOrgs(userId))[0].id

  const result = await sendIntranet({
    query: APPLY_FEATURE_FLAG,
    variables: {flagName: 'Reports', subjects: {orgIds: [orgId]}}
  })

  expect(result).toEqual({
    data: {
      applyFeatureFlag: {
        __typename: 'ApplyFeatureFlagSuccess',
        organizations: [{id: orgId}]
      }
    }
  })
})

test('Apply feature flag to a non-existent organization returns an error', async () => {
  const result = await sendIntranet({
    query: APPLY_FEATURE_FLAG,
    variables: {flagName: 'Reports', subjects: {orgIds: ['missingOrgId']}}
  })

  expect(result).toEqual({
    data: {
      applyFeatureFlag: {
        __typename: 'ErrorPayload',
        error: {
          message: 'Organizations not found: missingOrgId'
        }
      }
    }
  })
})
