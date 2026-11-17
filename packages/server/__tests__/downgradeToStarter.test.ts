import type {TierEnum} from '../graphql/public/resolverTypes'
import getKysely from '../postgres/getKysely'
import {createOrgAdmin, getTestEmail, sendIntranet, sendPublic} from './common'

const DOWNGRADE_TO_STARTER = `
  mutation DowngradeToStarter($orgId: ID!) {
    downgradeToStarter(orgId: $orgId) {
      organization {
        billingTier
      }
    }
  }
`

const createOrgOnTier = async (tier: TierEnum) => {
  const {orgId, cookie} = await createOrgAdmin(getTestEmail())
  await getKysely().updateTable('Organization').set({tier}).where('id', '=', orgId).execute()
  return {orgId, cookie}
}

const getTier = async (orgId: string) => {
  const {tier} = await getKysely()
    .selectFrom('Organization')
    .select('tier')
    .where('id', '=', orgId)
    .executeTakeFirstOrThrow()
  return tier
}

test('a billing leader can downgrade a Team organization', async () => {
  const {orgId, cookie} = await createOrgOnTier('team')
  const res = await sendPublic({query: DOWNGRADE_TO_STARTER, variables: {orgId}, cookie})
  expect(res).toEqual({data: {downgradeToStarter: {organization: {billingTier: 'starter'}}}})
})

test('a billing leader cannot downgrade an Enterprise organization', async () => {
  const {orgId, cookie} = await createOrgOnTier('enterprise')
  const res = await sendPublic({query: DOWNGRADE_TO_STARTER, variables: {orgId}, cookie})
  expect(res.errors).toMatchObject([{extensions: {code: 'FORBIDDEN'}}])
  expect(await getTier(orgId)).toBe('enterprise')
})

test('a superuser can downgrade an Enterprise organization', async () => {
  const {orgId} = await createOrgOnTier('enterprise')
  const res = await sendIntranet({query: DOWNGRADE_TO_STARTER, variables: {orgId}})
  expect(res).toEqual({data: {downgradeToStarter: {organization: {billingTier: 'starter'}}}})
  expect(await getTier(orgId)).toBe('starter')
})
