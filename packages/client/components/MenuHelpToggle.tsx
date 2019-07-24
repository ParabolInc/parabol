import React, {ReactNode, useEffect} from 'react'
import styled from '@emotion/styled'
import HelpMenuToggle from './MeetingHelp/HelpMenuToggle'
import Menu from './Menu'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import useTimeout from '../hooks/useTimeout'
import isDemoRoute from '../utils/isDemoRoute'
import useFABPad from '../hooks/useFABPad'

interface Props {
  menu: ReactNode
  floatAboveBottomBar?: boolean
}

const TallMenu = styled(Menu)({
  maxHeight: 320
})

const MeetingHelpToggle = (props: Props) => {
  const {floatAboveBottomBar, menu} = props
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu(MenuPosition.LOWER_RIGHT)
  const demoPauseOpen = useTimeout(1000)
  useEffect(() => {
    if (demoPauseOpen && isDemoRoute()) {
      togglePortal()
    }
  }, [demoPauseOpen])
  useFABPad(originRef)
  return (
    <>
      <HelpMenuToggle
        floatAboveBottomBar={!!floatAboveBottomBar}
        ref={originRef}
        onClick={togglePortal}
        onMouseEnter={(menu as any).type ? (menu as any).type.preload : undefined}
      />
      {menuPortal(
        <TallMenu ariaLabel='Meeting tips' {...menuProps}>
          {menu}
        </TallMenu>
      )}
    </>
  )
}

export default MeetingHelpToggle
