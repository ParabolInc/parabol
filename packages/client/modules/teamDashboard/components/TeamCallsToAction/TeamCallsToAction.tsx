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
import lazyPreload from '../../../../utils/lazyPreload'
import {Breakpoint, Gutters} from '../../../../types/constEnums'

interface Props {
  teamId: string
}

const ButtonBlock = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  minWidth: 224,
  paddingLeft: Gutters.DASH_GUTTER_SMALL,

  [`@media (min-width: ${Breakpoint.DASHBOARD_WIDE})`]: {
    minWidth: 208,
    paddingLeft: Gutters.DASH_GUTTER_LARGE
  }
})

const StartButton = styled(PrimaryButton)({
  width: '100%'
})

const TeamCallsToActionMenu = lazyPreload(() =>
  import(
    /* webpackChunkName: 'TeamCallsToActionMenu' */
    './TeamCallsToActionMenu'
  )
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
