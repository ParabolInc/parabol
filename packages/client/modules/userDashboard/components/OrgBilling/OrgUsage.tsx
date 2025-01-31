import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {OrgUsage_organization$key} from '../../../../__generated__/OrgUsage_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import useRouter from '../../../../hooks/useRouter'

interface Props {
  organizationRef: OrgUsage_organization$key
}

const OrgUsage = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgUsage_organization on Organization {
        id
        allTeamsCount
        orgUserCount {
          activeUserCount
          inactiveUserCount
        }
      }
    `,
    organizationRef
  )

  const {id: orgId, allTeamsCount, orgUserCount} = organization
  const totalUserCount = orgUserCount.activeUserCount + orgUserCount.inactiveUserCount
  const {history} = useRouter()

  return (
    <Panel className='mb-4 max-w-[976px]' label='Usage'>
      <div className='flex items-center justify-around border-t border-solid border-slate-300 p-4'>
        <a
          onClick={(e) => {
            e.preventDefault()
            history.push(`/me/organizations/${orgId}/teams`)
          }}
          className='cursor-pointer text-center text-sky-500 hover:text-sky-600'
        >
          <div className='mb-1 text-3xl font-bold'>{allTeamsCount}</div>
          <div className='flex items-center justify-center text-base text-slate-600'>
            Total teams
          </div>
        </a>
        <a
          onClick={(e) => {
            e.preventDefault()
            history.push(`/me/organizations/${orgId}/members`)
          }}
          className='cursor-pointer text-center text-sky-500 hover:text-sky-600'
        >
          <div className='mb-1 text-3xl font-bold'>{totalUserCount}</div>
          <div className='flex items-center justify-center text-base text-slate-600'>
            Total members
          </div>
        </a>
      </div>
    </Panel>
  )
}

export default OrgUsage
