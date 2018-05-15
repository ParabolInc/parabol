import React from 'react'
import MenuWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuWithShortcuts'
import MenuItemWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuItemWithShortcuts'
import type {Team} from 'universal/types/schema.flow'
import type {Dispatch} from 'react-redux'
import {connect} from 'react-redux'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import styled from 'react-emotion'
import {filterTeam} from 'universal/modules/userDashboard/ducks/userDashDuck'
import textOverflow from 'universal/styles/helpers/textOverflow'

type Props = {
  closePortal: () => void,
  dispatch: Dispatch<*>,
  teams: Array<Team>,
  teamFilterId: ?string
}

const Label = styled('div')({
  ...textOverflow,
  borderBottom: `1px solid ${appTheme.palette.mid30l}`,
  color: ui.palette.dark,
  fontSize: ui.menuItemFontSize,
  fontWeight: 600,
  lineHeight: ui.menuItemHeight,
  marginBottom: ui.menuGutterVertical,
  padding: `0 ${ui.menuGutterHorizontal}`
})

const UserDashTeamMenu = (props: Props) => {
  const {closePortal, dispatch, teams, teamFilterId} = props
  const defaultActiveIdx = teams.findIndex((team) => team.id === teamFilterId) + 2
  return (
    <MenuWithShortcuts
      ariaLabel={'Select the team to filter by'}
      closePortal={closePortal}
      defaultActiveIdx={defaultActiveIdx}
    >
      <Label>{'Filter by:'}</Label>
      <MenuItemWithShortcuts
        key={'teamFilterNULL'}
        label={'All teams'}
        onClick={() => dispatch(filterTeam(null))}
      />
      {teams.map((team) => (
        <MenuItemWithShortcuts
          key={`teamFilter${team.id}`}
          label={team.name}
          onClick={() => dispatch(filterTeam(team.id, team.name))}
        />
      ))}
    </MenuWithShortcuts>
  )
}

export default connect()(UserDashTeamMenu)
