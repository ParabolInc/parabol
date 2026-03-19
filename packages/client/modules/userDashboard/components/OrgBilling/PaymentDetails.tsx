import {Divider} from '@mui/material'
import {Elements} from '@stripe/react-stripe-js'
import {loadStripe, type StripeCardNumberElement} from '@stripe/stripe-js'
import graphql from 'babel-plugin-relay/macro'
import {type MutableRefObject, useRef} from 'react'
import {useFragment} from 'react-relay'
import type {PaymentDetails_organization$key} from '../../../../__generated__/PaymentDetails_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import {MONTHLY_PRICE} from '../../../../utils/constants'
import BillingForm from './BillingForm'

const stripePromise = loadStripe(window.__ACTION__.stripe)

type Props = {
  cardNumberRef: MutableRefObject<StripeCardNumberElement | null>
  organizationRef: PaymentDetails_organization$key
}

const PaymentDetails = (props: Props) => {
  const {cardNumberRef, organizationRef} = props

  const organization = useFragment(
    graphql`
      fragment PaymentDetails_organization on Organization {
        id
        orgUserCount {
          activeUserCount
        }
        coupon {
          percentOff
          durationInMonths
        }
      }
    `,
    organizationRef
  )
  const {id: orgId, orgUserCount, coupon} = organization
  const {activeUserCount} = orgUserCount
  const price = activeUserCount * MONTHLY_PRICE
  const discountedPrice = coupon ? price * (1 - coupon.percentOff / 100) : null
  const ref = useRef<HTMLDivElement | null>(null)

  return (
    <Panel label='Credit Card' className='max-w-[976px]'>
      {/* overflow-hidden, text-center, capitalize, leading-4 promoted from the two column divs below */}
      <div className='flex w-full flex-col-reverse flex-wrap items-start justify-between overflow-hidden border-slate-300 border-t px-4 py-3 text-center capitalize leading-4 md:flex-row'>
        <div className='flex w-full flex-wrap px-4 pb-4 md:w-1/2' ref={ref}>
          <h6 className='m-0 flex w-full pt-2 pb-4 font-semibold text-[22px] text-slate-800 capitalize leading-[30px]'>
            {'Credit Card Details'}
          </h6>
          <div className='w-full'>
            <Elements stripe={stripePromise}>
              <BillingForm cardNumberRef={cardNumberRef} orgId={orgId} />
            </Elements>
          </div>
        </div>
        <div className='flex w-full flex-wrap px-4 pb-4 md:w-1/2'>
          <h6 className='m-0 flex w-full pt-2 pb-4 font-semibold text-[22px] text-slate-800 capitalize leading-[30px]'>
            {'Team Plan Pricing'}
          </h6>
          <div className='w-full'>
            <span className='block pb-1 text-left font-semibold text-slate-600 text-xs uppercase'>
              {'Billing Cycle'}
            </span>
            <div className='flex pb-2 font-semibold text-base text-slate-800 capitalize leading-[30px]'>
              {'Monthly'}
            </div>
            <div className='pt-4'>
              <span className='block pb-1 text-left font-semibold text-slate-600 text-xs uppercase'>
                {'Active Users'}
              </span>
              <span className='block pb-2 text-left font-semibold text-slate-600 text-xs normal-case'>
                {'Active users are anyone who uses Parabol within a billing period'}
              </span>
              <div className='flex pb-2 font-semibold text-base text-slate-800 capitalize leading-[30px]'>
                {activeUserCount}
              </div>
            </div>
            <Divider />
            {coupon ? (
              <>
                {/* shared classes promoted from children to each row div */}
                <div className='flex justify-between pt-2 font-semibold text-base text-slate-800 capitalize leading-[30px]'>
                  <div>{'Price'}</div>
                  <div>{`$${price.toFixed(2)}`}</div>
                </div>
                <div className='flex justify-between font-medium text-base text-forest-700 capitalize leading-[30px]'>
                  <div>{`Discount (${coupon.percentOff}% off${coupon.durationInMonths ? ` for ${coupon.durationInMonths} months` : ''})`}</div>
                  <div>{`-$${(price - discountedPrice!).toFixed(2)}`}</div>
                </div>
                <div className='flex justify-between pb-2 font-semibold text-base text-slate-800 capitalize leading-[30px]'>
                  <div>{'Total'}</div>
                  <div>{`$${discountedPrice!.toFixed(2)}`}</div>
                </div>
              </>
            ) : (
              <div className='flex justify-between py-2 font-semibold text-base text-slate-800 capitalize leading-[30px]'>
                <div>{'Total'}</div>
                <div>{`$${price.toFixed(2)}`}</div>
              </div>
            )}
            <span className='block pb-2 text-left font-semibold text-slate-600 text-xs normal-case'>
              {'All prices are in USD'}
            </span>
          </div>
        </div>
      </div>
    </Panel>
  )
}

export default PaymentDetails
