import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {getStripeManager} from '../../../utils/stripe'
import type {MutationResolvers} from '../resolverTypes'

const addOrgCoupon: MutationResolvers['addOrgCoupon'] = async (
  _source,
  {orgId, couponId},
  {dataLoader}
) => {
  const organization = await dataLoader.get('organizations').load(orgId)
  if (!organization) {
    throw new GraphQLError('Organization not found')
  }
  if (organization.tier !== 'starter') {
    throw new GraphQLError('Coupon can only be added to starter-tier organizations')
  }

  const manager = getStripeManager()
  const coupon = await manager.retrieveCoupon(couponId)
  if (coupon instanceof Error) {
    throw new GraphQLError(`Stripe coupon not found: ${coupon.message}`)
  }
  if (!coupon.valid) {
    throw new GraphQLError(`Stripe coupon "${couponId}" is no longer valid`)
  }
  if (!coupon.percent_off) {
    throw new GraphQLError(`Stripe coupon "${couponId}" must have a percent_off amount`)
  }
  if (!coupon.duration_in_months) {
    throw new GraphQLError(`Stripe coupon "${couponId}" must have a defined duration in months`)
  }

  const pg = getKysely()
  await pg.updateTable('Organization').set({couponId}).where('id', '=', orgId).execute()
  organization.couponId = couponId

  return {organization}
}

export default addOrgCoupon
