import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import filterTeamMember from '../utils/relay/filterTeamMember'
import {TeamDashTeamMemberMenu_team} from '../__generated__/TeamDashTeamMemberMenu_team.graphql'
import DropdownMenuLabel from './DropdownMenuLabel'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {SearchMenuItem} from './SearchMenuItem'

interface Props {
  menuProps: MenuProps
  team: TeamDashTeamMemberMenu_team
}

const TeamDashTeamMemberMenu = (props: Props) => {
  //FIXME i18n: Search team members
  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const {menuProps, team} = props
  const {id: teamId, teamMembers, teamMemberFilter} = team
  const teamMemberFilterId = teamMemberFilter && teamMemberFilter.id
  const defaultActiveIdx =
    teamMembers.findIndex((teamMember) => teamMember.id === teamMemberFilterId) + 2

  const {
    query,
    filteredItems: matchedTeamMembers,
    onQueryChange
  } = useSearchFilter(teamMembers, (teamMember) => teamMember.preferredName)

  return (
    <Menu
      keepParentFocus
      ariaLabel={t('TeamDashTeamMemberMenu.SelectTheTeamMemberToFilterBy')}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
    >
      <DropdownMenuLabel>{t('TeamDashTeamMemberMenu.FilterByTeamMember:')}</DropdownMenuLabel>
      {teamMembers.length > 5 && (
        <SearchMenuItem placeholder='Search team members' onChange={onQueryChange} value={query} />
      )}
      {query && matchedTeamMembers.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          {t('TeamDashTeamMemberMenu.NoTeamMembersFound!')}
        </EmptyDropdownMenuItemLabel>
      )}
      {query === '' && (
        <MenuItem
          key={t('TeamDashTeamMemberMenu.Teammemberfilternull')}
          label={t('TeamDashTeamMemberMenu.AllTeamMembers')}
          onClick={() => filterTeamMember(atmosphere, teamId, null)}
        />
      )}
      {matchedTeamMembers.map((teamMember) => (
        <MenuItem
          key={`teamMemberFilter${teamMember.id}`}
          label={teamMember.preferredName}
          onClick={() => filterTeamMember(atmosphere, teamId, teamMember.id)}
        />
      ))}
    </Menu>
  )
}

export default createFragmentContainer(TeamDashTeamMemberMenu, {
  team: graphql`
    fragment TeamDashTeamMemberMenu_team on Team {
      id
      teamMemberFilter {
        id
      }
      teamMembers(sortBy: "preferredName") {
        id
        preferredName
      }
    }
  `
})
