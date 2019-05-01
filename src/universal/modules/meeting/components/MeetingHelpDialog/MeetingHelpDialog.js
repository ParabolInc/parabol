/**
 * Display a pop-up to show help content per meeting phase.
 *
 * @flow
 */

import React from 'react'
import styled from 'react-emotion'
import FloatingActionButton from 'universal/components/FloatingActionButton'
import IconLabel from 'universal/components/IconLabel'
import useMenu from 'universal/hooks/useMenu'
import {MenuPosition} from 'universal/hooks/useCoords'
import lazyPreload from 'universal/utils/lazyPreload'

type Props = {
  phase: string
}

const StyledButton = styled(FloatingActionButton)({
  height: '2rem',
  paddingLeft: 0,
  paddingRight: 0,
  width: '2rem'
})

const MeetingHelpDialogMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'MeetingHelpDialogMenu' */
    'universal/modules/meeting/components/MeetingHelpDialog/MeetingHelpDialogMenu')
)

const MeetingHelpDialog = ({phase}: Props) => {
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.LOWER_RIGHT)
  return (
    <React.Fragment>
      <StyledButton
        palette='white'
        onClick={togglePortal}
        innerRef={originRef}
        onMouseEnter={MeetingHelpDialogMenu.preload}
      >
        <IconLabel icon='help_outline' />
      </StyledButton>
      {menuPortal(<MeetingHelpDialogMenu phase={phase} menuProps={menuProps} />)}
    </React.Fragment>
  )
}

export default MeetingHelpDialog
