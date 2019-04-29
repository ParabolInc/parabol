/**
 * Displays the calls to action at the top of the team dashboard.
 *
 * @flow
 */
import type {RouterHistory} from 'react-router-dom'
import React from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import PrimaryButton from 'universal/components/PrimaryButton'
import IconLabel from 'universal/components/IconLabel'
import useMenu from 'universal/hooks/useMenu'
import {MenuPosition} from 'universal/hooks/useCoords'
import lazyPreload from 'universal/utils/lazyPreload'

type Props = {
  teamId: string,
  history: RouterHistory
}

const ButtonBlock = styled('div')({
  display: 'flex',
  minWidth: '14rem',
  paddingLeft: ui.dashGutterSmall,

  [ui.dashBreakpoint]: {
    minWidth: '13rem',
    paddingLeft: ui.dashGutterLarge
  }
})

const StartButton = styled(PrimaryButton)({
  width: '100%'
})

const TeamCallsToActionMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'TeamCallsToActionMenu' */
    'universal/modules/teamDashboard/components/TeamCallsToAction/TeamCallsToActionMenu')
)

const TeamCallToAction = (props: Props) => {
  const {teamId} = props
  const {togglePortal, originRef, menuPortal, closePortal, loadingWidth, portalState} = useMenu(
    MenuPosition.UPPER_RIGHT,
    {isDropdown: true}
  )
  return (
    <ButtonBlock>
      <StartButton
        onClick={togglePortal}
        onMouseEnter={TeamCallsToActionMenu.preload}
        innerRef={originRef}
      >
        <IconLabel icon='expand_more' iconAfter label='Start Meeting' />
      </StartButton>
      {menuPortal(
        <TeamCallsToActionMenu
          closePortal={closePortal}
          teamId={teamId}
          minWidth={loadingWidth}
          portalState={portalState}
        />
      )}
    </ButtonBlock>
  )
}

export default TeamCallToAction
