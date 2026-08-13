import {Elements} from '@stripe/react-stripe-js'
import {loadStripe} from '@stripe/stripe-js'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {OrgBillingCreditCardInfo_organization$key} from '~/__generated__/OrgBillingCreditCardInfo_organization.graphql'
import {Button} from '~/ui/Button/Button'
import {CreditCard} from '~/ui/icons'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import UpdatePayment from './UpdatePayment'

const stripePromise = loadStripe(window.__ACTION__.stripe)

interface Props {
  organizationRef: OrgBillingCreditCardInfo_organization$key
}

const OrgBillingCreditCardInfo = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgBillingCreditCardInfo_organization on Organization {
        id
        creditCard {
          brand
          expiry
          last4
        }
      }
    `,
    organizationRef
  )
  const {id: orgId, creditCard} = organization
  const [isUpdating, setIsUpdating] = useState(false)
  if (!creditCard) return null
  const {brand, last4, expiry} = creditCard

  const handleClose = () => {
    setIsUpdating(false)
  }

  const handleStartUpdating = () => {
    setIsUpdating(true)
  }

  if (isUpdating) {
    return (
      <Panel className='max-w-[976px]' label='Credit Card'>
        <Row className='flex-nowrap'>
          <Elements stripe={stripePromise}>
            <UpdatePayment handleClose={handleClose} orgId={orgId} />
          </Elements>
        </Row>
      </Panel>
    )
  }

  return (
    <Panel className='max-w-[976px]' label='Credit Card'>
      <div className='flex items-center justify-between border-hairline border-t p-4'>
        <div className='flex items-center text-fg-primary text-sm'>
          <CreditCard className='mr-4 text-fg-secondary' />
          <div className='sidebar-left:flex sidebar-left:items-center'>
            <div>
              <span className='mr-2 font-semibold'>{brand}</span>
              <span className='mr-8'>
                {'•••• •••• •••• '}
                {last4}
              </span>
            </div>
            <div>
              <span className='mr-2 font-semibold'>{'Expires'}</span>
              <span>{expiry}</span>
            </div>
          </div>
        </div>
        <Button variant='outline' size='sm' onClick={handleStartUpdating}>
          {'Update'}
        </Button>
      </div>
    </Panel>
  )
}

export default OrgBillingCreditCardInfo
