import {Article} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {OrgPlansAndBillingHeading_organization$key} from '../../../../__generated__/OrgPlansAndBillingHeading_organization.graphql'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {upperFirst} from '../../../../utils/upperFirst'

type Props = {
  organizationRef: OrgPlansAndBillingHeading_organization$key
}

const OrgPlansAndBillingHeading = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgPlansAndBillingHeading_organization on Organization {
        id
        name
        billingTier
        tier
        showDrawer
      }
    `,
    organizationRef
  )
  const atmosphere = useAtmosphere()
  const {id: orgId, name, billingTier, tier} = organization
  const tierName = upperFirst(tier)

  const handleClick = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const org = store.get(orgId)
      if (!org) return
      const showDrawer = org.getValue('showDrawer')
      org.setValue(!showDrawer, 'showDrawer')
    })
  }

  return (
    <div className='relative flex max-w-[976px] flex-wrap items-center justify-between py-4 text-fg-primary leading-6'>
      <h1 className='m-0 flex w-full items-center font-semibold text-[20px]'>
        {'Plans & Billing'}
      </h1>
      <p className='m-0 py-2'>
        <span className='font-semibold'>{name}</span>
        <span className='font-normal'>{` is currently on ${
          tier !== billingTier ? 'a Free Trial for ' : ''
        }the `}</span>
        <span className='font-semibold'>{`${tierName} Plan.`}</span>
      </p>
      <PlainButton className='flex flex-col items-center' onClick={handleClick}>
        <div className='h-5 w-5 content-center p-0 text-accent'>
          <Article />
        </div>
        <span className='font-semibold text-[12px] leading-[28px]'>{'Plan Details'}</span>
      </PlainButton>
    </div>
  )
}

export default OrgPlansAndBillingHeading
