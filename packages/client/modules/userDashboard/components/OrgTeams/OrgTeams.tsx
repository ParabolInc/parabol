import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {OrgTeams_organization$key} from '../../../../__generated__/OrgTeams_organization.graphql'
import AddTeamDialogRoot from '../../../../components/AddTeamDialogRoot'
import {Button} from '../../../../ui/Button/Button'
import {useDialogState} from '../../../../ui/Dialog/useDialogState'
import OrgTeamsRow from './OrgTeamsRow'
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
        teams {
          id
          name
          lastMetAt
          teamMembers {
            id
          }
          isViewerOnTeam
          ...OrgTeamsRow_team
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
  const {teams, allTeamsCount, tier} = organization
  const showingAllTeams = teams.length === allTeamsCount
  const viewerTeamCount = teams.length

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('desc')
    }
  }

  const sortedTeams = [...teams].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1
    if (sortBy === 'name') {
      return direction * a.name.localeCompare(b.name)
    } else if (sortBy === 'memberCount') {
      return direction * (a.teamMembers.length - b.teamMembers.length)
    } else {
      // lastMetAt
      const aLastMet = a.lastMetAt
      const bLastMet = b.lastMetAt
      if (!aLastMet && !bLastMet) return 0
      if (!aLastMet) return -direction
      if (!bLastMet) return direction
      return direction * (new Date(aLastMet).getTime() - new Date(bLastMet).getTime())
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
              {!showingAllTeams ? `(${allTeamsCount - viewerTeamCount} hidden)` : null}
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
              {sortedTeams.map((team) => (
                <OrgTeamsRow key={team.id} teamRef={team} />
              ))}
            </tbody>
          </table>
        </div>

        {tier !== 'enterprise' && allTeamsCount > viewerTeamCount && !showingAllTeams && (
          <TeaserOrgTeamsRow
            hiddenTeamCount={allTeamsCount - viewerTeamCount}
            orgId={organization.id}
          />
        )}
      </div>

      {isAddTeamDialogOpened ? (
        <AddTeamDialogRoot
          onTeamAdded={closeAddTeamDialog}
          onClose={closeAddTeamDialog}
          orgId={organization.id}
        />
      ) : null}
    </div>
  )
}

export default OrgTeams
