import type {DropdownMenuContentProps} from '@radix-ui/react-dropdown-menu'
import graphql from 'babel-plugin-relay/macro'
import {forwardRef, type ReactNode} from 'react'
import {useFragment} from 'react-relay'
import type {TeamPickerMenuContent_teams$key} from '../../__generated__/TeamPickerMenuContent_teams.graphql'
import useSearchFilter from '../../hooks/useSearchFilter'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuSearch} from '../../ui/Menu/MenuSearch'
import DropdownMenuLabel from '../DropdownMenuLabel'
import {EmptyDropdownMenuItemLabel} from '../EmptyDropdownMenuItemLabel'
import TeamPickerMenuItem from './TeamPickerMenuItem'

export const TEAM_PICKER_SEARCH_THRESHOLD = 8
const ONE_ORG_ONLY_REASON = 'A meeting series can only include teams from the same organization'

interface Props {
  teamsRef: TeamPickerMenuContent_teams$key
  selectedTeamIds: readonly string[]
  onSelectTeam: (teamId: string) => void
  isMultiple?: boolean
  restrictToOneOrg?: boolean
  header?: ReactNode
  align?: DropdownMenuContentProps['align']
  // pinned rows rendered above the search and list, e.g. an "All teams" or "Clear" action
  children?: ReactNode
}

// the radix menu portal clones its direct child with a ref, so this must forward it to the content
const TeamPickerMenuContent = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {
    teamsRef,
    selectedTeamIds,
    onSelectTeam,
    isMultiple = false,
    restrictToOneOrg,
    header,
    align = 'start',
    children
  } = props
  const teams = useFragment(
    graphql`
      fragment TeamPickerMenuContent_teams on Team @relay(plural: true) {
        id
        name
        orgId
        organization {
          name
        }
      }
    `,
    teamsRef
  )
  const {query, filteredItems, onQueryChange} = useSearchFilter(teams, (team) => team.name)
  const isMultiOrg = new Set(teams.map(({orgId}) => orgId)).size > 1
  const lockedOrgId = restrictToOneOrg
    ? teams.find((team) => selectedTeamIds.includes(team.id))?.orgId
    : undefined

  return (
    <MenuContent
      ref={ref}
      align={align}
      sideOffset={4}
      className='z-50 flex max-h-80 w-88 flex-col overflow-hidden py-0'
    >
      {header && <DropdownMenuLabel className='mb-0 shrink-0'>{header}</DropdownMenuLabel>}
      {children && <div className='shrink-0'>{children}</div>}
      {teams.length > TEAM_PICKER_SEARCH_THRESHOLD && (
        <MenuSearch
          className='my-1 shrink-0'
          placeholder='Search teams'
          onChange={onQueryChange}
          value={query}
        />
      )}
      <div className='min-h-0 overflow-auto py-1'>
        {filteredItems.length === 0 && (
          <EmptyDropdownMenuItemLabel>No teams found!</EmptyDropdownMenuItemLabel>
        )}
        {filteredItems.map((team) => (
          <TeamPickerMenuItem
            key={team.id}
            teamName={team.name}
            orgName={isMultiOrg ? team.organization.name : null}
            isSelected={selectedTeamIds.includes(team.id)}
            isMultiple={isMultiple}
            disabledReason={
              lockedOrgId && team.orgId !== lockedOrgId ? ONE_ORG_ONLY_REASON : undefined
            }
            onSelect={() => onSelectTeam(team.id)}
          />
        ))}
      </div>
    </MenuContent>
  )
})

export default TeamPickerMenuContent
