import {NavigateNext} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {OrgNav_organization$key} from '../../../../__generated__/OrgNav_organization.graphql'

type Props = {
  organizationRef: OrgNav_organization$key
}

const OrgNav = (props: Props) => {
  const {organizationRef} = props
  const navigate = useNavigate()
  const organization = useFragment(
    graphql`
      fragment OrgNav_organization on Organization {
        name
      }
    `,
    organizationRef
  )
  const {name: orgName} = organization

  return (
    <div className='flex max-w-full overflow-hidden py-4 text-[14px]'>
      <span
        className='text-nowrap font-normal hover:cursor-pointer'
        onClick={() => navigate('/meetings')}
      >
        Dashboard
      </span>
      <div className='flex items-center opacity-50'>
        <NavigateNext className='h-[18px] text-fg-primary' />
      </div>
      <span
        className='text-nowrap font-normal hover:cursor-pointer'
        onClick={() => navigate('/me/organizations')}
      >
        Organization
      </span>
      <div className='flex items-center opacity-50'>
        <NavigateNext className='h-[18px] text-fg-primary' />
      </div>
      <span className='overflow-hidden text-ellipsis text-nowrap font-semibold hover:cursor-default'>
        {orgName}
      </span>
    </div>
  )
}

export default OrgNav
