import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {BillingLeaders_organization$key} from '../../../../__generated__/BillingLeaders_organization.graphql'
import IconLabel from '../../../../components/IconLabel'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import {Button} from '../../../../ui/Button/Button'
import {cn} from '../../../../ui/cn'
import plural from '../../../../utils/plural'
import BillingLeader from './BillingLeader'
import NewBillingLeaderInput from './NewBillingLeaderInput'

type Props = {
  organizationRef: BillingLeaders_organization$key
}

const BillingLeaders = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment BillingLeaders_organization on Organization {
        ...BillingLeader_organization
        ...NewBillingLeaderInput_organization
        isViewerBillingLeader: isBillingLeader
        billingLeaders {
          id
          ...BillingLeader_orgUser
        }
      }
    `,
    organizationRef
  )
  const [isAddingBillingLeader, setIsAddingBillingLeader] = useState(false)
  const {billingLeaders, isViewerBillingLeader} = organization
  const billingLeaderCount = billingLeaders.length

  const handleClick = () => {
    setIsAddingBillingLeader(true)
  }

  const removeInput = () => {
    setIsAddingBillingLeader(false)
  }

  return (
    <Panel className='mb-4 max-w-[976px]' label={plural(billingLeaders.length, 'Billing Leader')}>
      <Row className='bg-inherit px-4 py-3'>
        <span className='pt-2 text-[16px] text-fg-primary'>
          {
            'All billing leaders are able to see and update credit card information, change plans, and view invoices.'
          }
        </span>
      </Row>
      {billingLeaders.map((billingLeader, idx) => (
        <BillingLeader
          key={billingLeader.id}
          billingLeaderRef={billingLeader}
          isFirstRow={idx === 0}
          billingLeaderCount={billingLeaderCount}
          organizationRef={organization}
        />
      ))}
      {isViewerBillingLeader && (
        <Row className={cn('px-4 py-3', isAddingBillingLeader ? 'bg-surface-well' : 'bg-inherit')}>
          {isAddingBillingLeader ? (
            <NewBillingLeaderInput removeInput={removeInput} organizationRef={organization} />
          ) : (
            <div
              className='flex flex-row text-accent hover:cursor-pointer hover:text-fg-primary'
              onClick={handleClick}
            >
              <Button
                variant='flat'
                size='sm'
                className='h-11 w-11 text-inherit hover:bg-transparent'
              >
                <IconLabel iconLarge icon='add' />
              </Button>
              <RowInfo>
                <RowInfoHeader>
                  <RowInfoHeading className='font-normal text-inherit'>
                    Add Billing Leader
                  </RowInfoHeading>
                </RowInfoHeader>
              </RowInfo>
            </div>
          )}
        </Row>
      )}
    </Panel>
  )
}

export default BillingLeaders
