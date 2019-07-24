/**
 * Displays the calls to action at the top of the team dashboard.
 *
 */
import React from 'react'
import styled from '@emotion/styled'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import ui from '../../../../styles/ui'
import lazyPreload from '../../../../utils/lazyPreload'

interface Props {
  teamId: string
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
  const {togglePortal, originRef, menuPortal, menuProps, loadingWidth} = useMenu(
    MenuPosition.UPPER_RIGHT,
    {isDropdown: true}
  )
  return (
    <ButtonBlock>
      <StartButton
        onClick={togglePortal}
        onMouseEnter={TeamCallsToActionMenu.preload}
        ref={originRef}
      >
        <IconLabel icon='expand_more' iconAfter label='Start Meeting' />
      </StartButton>
      {menuPortal(
        <TeamCallsToActionMenu menuProps={menuProps} teamId={teamId} minWidth={loadingWidth} />
      )}
    </ButtonBlock>
  )
}

export default TeamCallToAction
