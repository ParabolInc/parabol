import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {OrgTeamsTable_organization$key} from '../../../../__generated__/OrgTeamsTable_organization.graphql'
import {cn} from '../../../../ui/cn'
import OrgTeamPlacementMenu from './OrgTeamPlacementMenu'
import OrgTeamsRow from './OrgTeamsRow'
import OrgTeamsTableHeader from './OrgTeamsTableHeader'
import OrgTeamsUnplacedBanner from './OrgTeamsUnplacedBanner'
import sortOrgTeams, {type OrgTeamsSortDirection, type OrgTeamsSortField} from './sortOrgTeams'
import TeaserOrgTeamsRow from './TeaserOrgTeamsRow'
import {toPlacedValueIds} from './teamStructureEdits'

type Props = {
  organizationRef: OrgTeamsTable_organization$key
}

const OrgTeamsTable = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgTeamsTable_organization on Organization {
        id
        tier
        isOrgAdmin
        isBillingLeader
        teamStructure {
          id
          name
          values {
            id
            name
            teamIds
          }
        }
        teams {
          id
          name
          lastMetAt
          teamMembersCount
          isViewerOnTeam
          ...OrgTeamsRow_team
        }
        allTeamsCount
      }
    `,
    organizationRef
  )

  const [sortBy, setSortBy] = useState<OrgTeamsSortField>('lastMetAt')
  const [sortDirection, setSortDirection] = useState<OrgTeamsSortDirection>('desc')
  const [isShowingUnplaced, setIsShowingUnplaced] = useState(false)
  const {
    teams,
    allTeamsCount,
    tier,
    isOrgAdmin,
    isBillingLeader,
    teamStructure: levels
  } = organization
  const placedValueIds = toPlacedValueIds(levels)
  const isUnplaced = (teamId: string) =>
    levels.some((level) => !placedValueIds.get(level.id)?.has(teamId))
  const unplacedCount = teams.filter(({id}) => isUnplaced(id)).length
  const hasLevels = levels.length > 0
  const showingAllTeams = teams.length === allTeamsCount
  const viewerTeamCount = teams.length

  const handleSort = (field: OrgTeamsSortField) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('desc')
    }
  }

  const sortedTeams = sortOrgTeams(teams, sortBy, sortDirection)
  const shownTeams =
    isShowingUnplaced && unplacedCount > 0
      ? sortedTeams.filter(({id}) => isUnplaced(id))
      : sortedTeams

  return (
    <div className='overflow-hidden rounded-md border border-hairline bg-surface-card shadow-xs'>
      <div className='bg-surface-raised px-4 py-2'>
        <div className='flex w-full justify-between'>
          <div className='flex items-center font-bold'>
            {allTeamsCount} {' total '}
            {!showingAllTeams ? `(${allTeamsCount - viewerTeamCount} hidden)` : null}
          </div>
        </div>
      </div>
      {hasLevels && unplacedCount > 0 && (
        <OrgTeamsUnplacedBanner
          unplacedCount={unplacedCount}
          isShowingUnplaced={isShowingUnplaced}
          onToggle={() => setIsShowingUnplaced(!isShowingUnplaced)}
        />
      )}
      <div className='w-full overflow-x-auto px-4'>
        <table
          className={cn(
            'w-full border-collapse',
            hasLevels ? 'min-w-[600px]' : 'table-fixed md:table-auto'
          )}
        >
          <OrgTeamsTableHeader
            levels={levels}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <tbody>
            {shownTeams.map((team) => (
              <OrgTeamsRow key={team.id} teamRef={team} isOrgAdmin={isOrgAdmin}>
                {levels.map((level) => (
                  <td key={level.id} className='px-3 py-1.5'>
                    <OrgTeamPlacementMenu
                      teamId={team.id}
                      teamName={team.name}
                      level={level}
                      valueId={placedValueIds.get(level.id)?.get(team.id)}
                      canPlace={isBillingLeader}
                    />
                  </td>
                ))}
              </OrgTeamsRow>
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
  )
}

export default OrgTeamsTable
