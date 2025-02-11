import {ChevronRight} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {format} from 'date-fns'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import {OrgTeams_organization$key} from '../../../../__generated__/OrgTeams_organization.graphql'
import AddTeamDialogRoot from '../../../../components/AddTeamDialogRoot'
import {Button} from '../../../../ui/Button/Button'
import {useDialogState} from '../../../../ui/Dialog/useDialogState'
import TeaserOrgTeamsRow from './TeaserOrgTeamsRow'

type Props = {
  organizationRef: OrgTeams_organization$key
}

type SortField = 'name' | 'memberCount' | 'lastMetAt'
type SortDirection = 'asc' | 'desc'

const OrgTeams = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgTeams_organization on Organization {
        id
        tier
        hasPublicTeamsFlag: featureFlag(featureName: "publicTeams")
        allTeams {
          id
          name
          teamMembers {
            id
            isSelf
            isLead
            preferredName
          }
          activeMeetings {
            id
            createdAt
          }
        }
        viewerTeams {
          id
        }
        allTeamsCount
      }
    `,
    organizationRef
  )

  const {
    open: openAddTeamDialog,
    close: closeAddTeamDialog,
    isOpen: isAddTeamDialogOpened
  } = useDialogState()

  const [sortBy, setSortBy] = useState<SortField>('lastMetAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const {allTeams, tier, viewerTeams, allTeamsCount, hasPublicTeamsFlag} = organization
  const showAllTeams = allTeams.length === allTeamsCount || hasPublicTeamsFlag
  const viewerTeamCount = viewerTeams.length

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('desc')
    }
  }

  const sortedTeams = [...allTeams].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1
    if (sortBy === 'name') {
      return direction * a.name.localeCompare(b.name)
    } else if (sortBy === 'memberCount') {
      return direction * (a.teamMembers.length - b.teamMembers.length)
    } else {
      // lastMetAt
      const aLastMeeting = a.activeMeetings[0]?.createdAt
      const bLastMeeting = b.activeMeetings[0]?.createdAt
      if (!aLastMeeting && !bLastMeeting) return 0
      if (!aLastMeeting) return -direction
      if (!bLastMeeting) return direction
      return direction * (new Date(aLastMeeting).getTime() - new Date(bLastMeeting).getTime())
    }
  })

  return (
    <div className='max-w-4xl pb-4'>
      <div className='flex items-center justify-center py-1'>
        <div>
          <h1 className='text-2xl leading-7 font-semibold'>Teams</h1>
        </div>
        <div className='ml-auto'>
          <Button
            variant='secondary'
            shape='pill'
            className='w-32 py-2 text-base'
            onClick={openAddTeamDialog}
          >
            Add team
          </Button>
        </div>
      </div>

      <div className='overflow-hidden rounded-md border border-slate-300 bg-white shadow-xs'>
        <div className='bg-slate-100 px-4 py-2'>
          <div className='flex w-full justify-between'>
            <div className='flex items-center font-bold'>
              {allTeamsCount} {' total '}
              {!showAllTeams ? `(${allTeamsCount - viewerTeamCount} hidden)` : null}
            </div>
          </div>
        </div>
        <div className='w-full overflow-x-auto px-4'>
          <table className='w-full table-fixed border-collapse md:table-auto'>
            <thead>
              <tr className='border-b border-slate-300'>
                <th
                  className='w-[60%] cursor-pointer p-3 text-left font-semibold'
                  onClick={() => handleSort('name')}
                >
                  Team
                  {sortBy === 'name' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </th>
                <th
                  className='w-[20%] cursor-pointer p-3 text-left font-semibold'
                  onClick={() => handleSort('memberCount')}
                >
                  Member Count
                  {sortBy === 'memberCount' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </th>
                <th
                  className='w-[20%] cursor-pointer p-3 text-left font-semibold'
                  onClick={() => handleSort('lastMetAt')}
                >
                  Last Met At
                  {sortBy === 'lastMetAt' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team) => {
                const viewerTeamMember = team.teamMembers.find((m) => m.isSelf)
                const isLead = viewerTeamMember?.isLead
                const isMember = !!viewerTeamMember && !isLead
                return (
                  <tr key={team.id} className='hover:bg-slate-50 border-b border-slate-300'>
                    <td className='p-3'>
                      <Link
                        to={`teams/${team.id}`}
                        className='text-gray-700 hover:text-gray-900 flex items-center text-lg font-bold'
                      >
                        <div className='flex flex-1 items-center'>
                          {team.name}
                          {isLead && (
                            <span className='ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white'>
                              Team Lead
                            </span>
                          )}
                          {isMember && (
                            <span className='ml-2 rounded-full bg-sky-500 px-2 py-0.5 text-xs text-white'>
                              Member
                            </span>
                          )}
                        </div>
                        <ChevronRight className='ml-2 text-slate-600' />
                      </Link>
                    </td>
                    <td className='text-gray-600 p-3'>{team.teamMembers.length}</td>
                    <td className='text-gray-600 p-3'>
                      {team.activeMeetings[0]?.createdAt
                        ? format(new Date(team.activeMeetings[0].createdAt), 'yyyy-MM-dd')
                        : 'Never'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {tier !== 'enterprise' && allTeamsCount > viewerTeamCount && !showAllTeams && (
          <TeaserOrgTeamsRow
            hiddenTeamCount={allTeamsCount - viewerTeamCount}
            orgId={organization.id}
          />
        )}
      </div>

      {isAddTeamDialogOpened ? (
        <AddTeamDialogRoot onAddTeam={closeAddTeamDialog} onClose={closeAddTeamDialog} />
      ) : null}
    </div>
  )
}

export default OrgTeams
