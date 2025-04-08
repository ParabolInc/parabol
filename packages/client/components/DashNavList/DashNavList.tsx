import styled from '@emotion/styled'
import {ManageAccounts} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {DashNavList_organization$key} from '../../__generated__/DashNavList_organization.graphql'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import sortByTier from '../../utils/sortByTier'
import DashNavListTeams from './DashNavListTeams'
import EmptyTeams from './EmptyTeams'

const StyledIcon = styled(ManageAccounts)({
  height: 18,
  width: 18
})

interface Props {
  organizationsRef: DashNavList_organization$key
  onClick?: () => void
}

const DashNavList = (props: Props) => {
  const {onClick, organizationsRef} = props
  const organizations = useFragment(
    graphql`
      fragment DashNavList_organization on Organization @relay(plural: true) {
        ...DashNavListTeams_organization
        ...EmptyTeams_organization
        id
        name
        tier
        teams {
          id
          isViewerOnTeam
        }
      }
    `,
    organizationsRef
  )

  const sortedOrgs = sortByTier(organizations)

  return (
    <div className='w-full p-3 pt-4 pb-0'>
      {sortedOrgs.map((org) => (
        <div key={org.id} className='w-full pb-4'>
          <div className='mb-1 flex min-w-0 flex-1 flex-wrap items-center justify-between'>
            <span className='flex-1 pl-3 text-base leading-6 font-semibold text-slate-700'>
              {org.name}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  className='flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-300'
                  href={`/me/organizations/${org.id}/billing`}
                >
                  <StyledIcon />
                </a>
              </TooltipTrigger>
              <TooltipContent side='bottom' align='center' sideOffset={4}>
                {'Settings & Members'}
              </TooltipContent>
            </Tooltip>
          </div>
          <DashNavListTeams onClick={onClick} organizationRef={org} />
          {!org.teams.some((team) => team.isViewerOnTeam) && <EmptyTeams organizationRef={org} />}
        </div>
      ))}
    </div>
  )
}

graphql`
  fragment DashNavListTeam on Team {
    id
    isPaid
    name
    isViewerOnTeam
    tier
    organization {
      id
      name
      lockedAt
    }
  }
`

export default DashNavList
