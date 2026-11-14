import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {BillingLeaders_organization$key} from '../../../../__generated__/BillingLeaders_organization.graphql'
import IconLabel from '../../../../components/IconLabel'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import {Menu} from '../../../../ui/Menu/Menu'
import plural from '../../../../utils/plural'
import BillingLeader from './BillingLeader'
import NewBillingLeaderMenu from './NewBillingLeaderMenu'

type Props = {
  organizationRef: BillingLeaders_organization$key
}

const BillingLeaders = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment BillingLeaders_organization on Organization {
        ...BillingLeader_organization
        ...NewBillingLeaderMenu_organization
        isViewerBillingLeader: isBillingLeader
        billingLeaders {
          id
          ...BillingLeader_orgUser
        }
      }
    `,
    organizationRef
  )
  const {billingLeaders, isViewerBillingLeader} = organization
  const billingLeaderCount = billingLeaders.length

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
        <Row className='bg-inherit px-4 py-3'>
          <Menu
            trigger={
              <button
                type='button'
                className='flex cursor-pointer flex-row rounded-md text-accent hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-accent data-[state=open]:text-fg-primary'
              >
                <div className='flex h-11 w-11 items-center justify-center'>
                  <IconLabel iconLarge icon='add' />
                </div>
                <RowInfo>
                  <RowInfoHeader>
                    <RowInfoHeading className='font-normal text-inherit'>
                      Add Billing Leader
                    </RowInfoHeading>
                  </RowInfoHeader>
                </RowInfo>
              </button>
            }
          >
            <NewBillingLeaderMenu organizationRef={organization} />
          </Menu>
        </Row>
      )}
    </Panel>
  )
}

export default BillingLeaders
