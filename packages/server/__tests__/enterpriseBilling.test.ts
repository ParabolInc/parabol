import type {TierEnum} from '../graphql/public/resolverTypes'
import getKysely from '../postgres/getKysely'
import {getTestEmail, sendPublic, signUpWithEmail} from './common'

const UPDATE_CREDIT_CARD = `
  mutation UpdateCreditCard($orgId: ID!, $paymentMethodId: ID!) {
    updateCreditCard(orgId: $orgId, paymentMethodId: $paymentMethodId) {
      __typename
    }
  }
`

const CREATE_STRIPE_SUBSCRIPTION = `
  mutation CreateStripeSubscription($orgId: ID!, $paymentMethodId: ID!) {
    createStripeSubscription(orgId: $orgId, paymentMethodId: $paymentMethodId) {
      __typename
    }
  }
`

const createBillingLeaderOnTier = async (tier: TierEnum, stripeSubscriptionId: string | null) => {
  const {orgId, cookie} = await signUpWithEmail(getTestEmail())
  await getKysely()
    .updateTable('Organization')
    .set({tier, stripeSubscriptionId})
    .where('id', '=', orgId)
    .execute()
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

const variables = (orgId: string) => ({orgId, paymentMethodId: 'pm_card_visa'})

test('a billing leader cannot update the card of an Enterprise organization', async () => {
  const {orgId, cookie} = await createBillingLeaderOnTier('enterprise', 'sub_enterprise')
  const res = await sendPublic({query: UPDATE_CREDIT_CARD, variables: variables(orgId), cookie})
  expect(res.errors).toMatchObject([{extensions: {code: 'FORBIDDEN'}}])
  expect(await getTier(orgId)).toBe('enterprise')
})

test('a billing leader can reach updateCreditCard on a Team organization', async () => {
  const {orgId, cookie} = await createBillingLeaderOnTier('team', null)
  const res = await sendPublic({query: UPDATE_CREDIT_CARD, variables: variables(orgId), cookie})
  expect(res.errors).toMatchObject([
    {message: 'Organization is not subscribed to a plan', extensions: {code: 'CONFLICT'}}
  ])
})

test('an org member cannot start a Team subscription on an Enterprise organization', async () => {
  const {orgId, cookie} = await createBillingLeaderOnTier('enterprise', null)
  const res = await sendPublic({
    query: CREATE_STRIPE_SUBSCRIPTION,
    variables: variables(orgId),
    cookie
  })
  expect(res.errors).toMatchObject([{extensions: {code: 'FORBIDDEN'}}])
  expect(await getTier(orgId)).toBe('enterprise')
})

test('an org member can reach createStripeSubscription on a Starter organization', async () => {
  const {orgId, cookie} = await createBillingLeaderOnTier('starter', 'sub_existing')
  const res = await sendPublic({
    query: CREATE_STRIPE_SUBSCRIPTION,
    variables: variables(orgId),
    cookie
  })
  expect(res.errors).toMatchObject([
    {message: 'Organization already has a subscription', extensions: {code: 'CONFLICT'}}
  ])
})
