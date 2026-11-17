import getKysely from '../postgres/getKysely'
import {sendIntranet, signUp} from './common'

const applyDatabasesFlag = (orgIds: string[]) =>
  sendIntranet({
    query: `
      mutation ApplyFeatureFlag($orgIds: [ID!]) {
        applyFeatureFlag(flagName: "Databases", subjects: {orgIds: $orgIds}) {
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
    `,
    variables: {orgIds}
  })

const getFlagOwnerCount = async (orgId: string) => {
  const owners = await getKysely()
    .selectFrom('FeatureFlagOwner')
    .select('orgId')
    .where('featureName', '=', 'Databases')
    .where('orgId', '=', orgId)
    .execute()
  return owners.length
}

test('applies the flag to an existing subject', async () => {
  const {orgId} = await signUp()

  const res = await applyDatabasesFlag([orgId])

  expect(res).toEqual({data: {applyFeatureFlag: {organizations: [{id: orgId}]}}})
  expect(await getFlagOwnerCount(orgId)).toBe(1)
})

test('applying the flag twice to a subject is not an error', async () => {
  const {orgId} = await signUp()

  await applyDatabasesFlag([orgId])
  const res = await applyDatabasesFlag([orgId])

  expect(res).toEqual({data: {applyFeatureFlag: {organizations: [{id: orgId}]}}})
  expect(await getFlagOwnerCount(orgId)).toBe(1)
})

test('names the subjects that do not exist and applies the flag to none', async () => {
  const {orgId} = await signUp()

  const res = await applyDatabasesFlag([orgId, 'missingOrg'])

  expect(res.errors?.[0]).toMatchObject({
    message: 'No Organization found with ID: missingOrg',
    extensions: {code: 'NOT_FOUND'}
  })
  expect(await getFlagOwnerCount(orgId)).toBe(0)
})
