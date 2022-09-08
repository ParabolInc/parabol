import graphql from 'babel-plugin-relay/macro'
import React, {useMemo, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useRouter from '~/hooks/useRouter'
import useSearchFilter from '~/hooks/useSearchFilter'
import {UserTaskViewFilterLabels} from '~/types/constEnums'
import constructUserTaskFilterQueryParamURL from '~/utils/constructUserTaskFilterQueryParamURL'
import {useUserTaskFilters} from '~/utils/useUserTaskFilters'
import {MenuProps} from '../hooks/useMenu'
import {UserDashTeamMemberMenu_viewer} from '../__generated__/UserDashTeamMemberMenu_viewer.graphql'
import DropdownMenuLabel from './DropdownMenuLabel'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {SearchMenuItem} from './SearchMenuItem'

interface Props {
  menuProps: MenuProps
  viewer: UserDashTeamMemberMenu_viewer | null
}

const UserDashTeamMemberMenu = (props: Props) => {
  const {t} = useTranslation()

  const {history} = useRouter()
  const {menuProps, viewer} = props

  const atmosphere = useAtmosphere()
  const {userIds, teamIds, showArchived} = useUserTaskFilters(atmosphere.viewerId)

  const oldTeamsRef = useRef<any>([])
  const nextTeams = viewer?.teams ?? oldTeamsRef.current
  if (nextTeams) {
    oldTeamsRef.current = nextTeams
  }
  const teams = oldTeamsRef.current

  const showAllTeamMembers = !!teamIds
  const {filteredTeamMembers, defaultActiveIdx} = useMemo(() => {
    const filteredTeams = teamIds ? teams.filter(({id: teamId}) => teamIds.includes(teamId)) : teams
    const keySet = new Set()
    const filteredTeamMembers = [] as {
      userId: string
      preferredName: string
    }[]
    const teamMembers = filteredTeams.map(({teamMembers}) => teamMembers.flat()).flat()
    teamMembers.forEach((teamMember) => {
      const userKey = teamMember.userId
      if (!keySet.has(userKey)) {
        keySet.add(userKey)
        filteredTeamMembers.push(teamMember)
      }
    })
    filteredTeamMembers.sort((a, b) => (a.preferredName > b.preferredName ? 1 : -1))
    return {
      filteredTeamMembers,
      defaultActiveIdx:
        filteredTeamMembers.findIndex((teamMember) => userIds?.includes(teamMember.userId)) +
        (showAllTeamMembers ? 2 : 1)
    }
  }, [teamIds, userIds])

  const {
    query,
    filteredItems: matchedFilteredTeamMembers,
    onQueryChange
  } = useSearchFilter(filteredTeamMembers, (item) => item.preferredName)

  return (
    <Menu
      keepParentFocus
      ariaLabel={t('UserDashTeamMemberMenu.SelectTheTeamMemberToFilterBy')}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
    >
      <DropdownMenuLabel>{t('UserDashTeamMemberMenu.FilterByTeamMember')}</DropdownMenuLabel>
      {filteredTeamMembers.length > 5 && (
        <SearchMenuItem
          placeholder={t('UserDashTeamMemberMenu.SearchTeamMembers')}
          onChange={onQueryChange}
          value={query}
        />
      )}
      {query && matchedFilteredTeamMembers.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          {t('UserDashTeamMemberMenu.NoTeamMembersFound')}
        </EmptyDropdownMenuItemLabel>
      )}
      {query === '' && showAllTeamMembers && (
        <MenuItem
          key={t('UserDashTeamMemberMenu.TeamMemberFilterNull')}
          label={UserTaskViewFilterLabels.ALL_TEAM_MEMBERS}
          onClick={() =>
            history.push(constructUserTaskFilterQueryParamURL(teamIds, null, showArchived))
          }
        />
      )}
      {matchedFilteredTeamMembers.map((teamMember) => (
        <MenuItem
          key={t('UserDashTeamMemberMenu.TeamMemberFilterTeamMemberUserId', {
            teamMemberUserId: teamMember.userId
          })}
          dataCy={t('UserDashTeamMemberMenu.TeamMemberFilterTeamMemberUserId', {
            teamMemberUserId: teamMember.userId
          })}
          label={teamMember.preferredName}
          onClick={() =>
            history.push(
              constructUserTaskFilterQueryParamURL(teamIds, [teamMember.userId], showArchived)
            )
          }
        />
      ))}
    </Menu>
  )
}

export default createFragmentContainer(UserDashTeamMemberMenu, {
  viewer: graphql`
    fragment UserDashTeamMemberMenu_viewer on User {
      id
      teams {
        id
        name
        teamMembers(sortBy: "preferredName") {
          userId
          preferredName
        }
      }
    }
  `
})
