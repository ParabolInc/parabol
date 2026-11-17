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
    throw new GraphQLError('Organization not found', {extensions: {code: 'NOT_FOUND'}})
  }
  if (organization.tier !== 'starter') {
    throw new GraphQLError('Coupon can only be added to starter-tier organizations', {
      extensions: {code: 'CONFLICT'}
    })
  }

  const manager = getStripeManager()
  const coupon = await manager.retrieveCoupon(couponId)
  if (coupon instanceof Error) {
    throw new GraphQLError(`Stripe coupon not found: ${coupon.message}`, {
      extensions: {code: 'NOT_FOUND'}
    })
  }
  if (!coupon.valid) {
    throw new GraphQLError(`Stripe coupon "${couponId}" is no longer valid`, {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (!coupon.percent_off) {
    throw new GraphQLError(`Stripe coupon "${couponId}" must have a percent_off amount`, {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (!coupon.duration_in_months) {
    throw new GraphQLError(`Stripe coupon "${couponId}" must have a defined duration in months`, {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  const pg = getKysely()
  await pg.updateTable('Organization').set({couponId}).where('id', '=', orgId).execute()
  organization.couponId = couponId

  return {organization}
}

export default addOrgCoupon
