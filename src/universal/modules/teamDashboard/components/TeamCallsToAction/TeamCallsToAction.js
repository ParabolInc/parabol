/**
 * Displays the calls to action at the top of the team dashboard.
 *
 * @flow
 */
import type {RouterHistory} from 'react-router-dom'
import React from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import LoadableTeamCallsToActionMenu from 'universal/modules/teamDashboard/components/TeamCallsToAction/LoadableTeamCallsToActionMenu'
import LoadableMenu from 'universal/components/LoadableMenu'
import Button from 'universal/components/Button/Button'

type Props = {
  teamId: string,
  history: RouterHistory
}

const ButtonGroup = styled('div')({
  display: 'flex',
  minWidth: '14rem',
  paddingLeft: ui.dashGutterSmall,

  [ui.dashBreakpoint]: {
    minWidth: '13rem',
    paddingLeft: ui.dashGutterLarge
  }
})

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
}

const TeamCallToAction = (props: Props) => {
  const {teamId} = props
  const buttonToggle = (
    <Button
      buttonSize='small'
      buttonStyle='primary'
      colorPalette='warm'
      icon='chevron-down'
      iconPlacement='right'
      isBlock
      label='Start Meeting'
    />
  )

  return (
    <ButtonGroup>
      <LoadableMenu
        LoadableComponent={LoadableTeamCallsToActionMenu}
        maxWidth={208}
        maxHeight={225}
        originAnchor={originAnchor}
        queryVars={{teamId}}
        targetAnchor={targetAnchor}
        toggle={buttonToggle}
      />
    </ButtonGroup>
  )
}

export default TeamCallToAction
