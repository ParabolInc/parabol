import React, {ReactNode, useEffect} from 'react'
import styled from 'react-emotion'
import HelpMenuToggle from 'universal/components/MeetingHelp/HelpMenuToggle'
import Menu from 'universal/components/Menu'
import {MenuPosition} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
import useTimeout from 'universal/hooks/useTimeout'
import isDemoRoute from 'universal/utils/isDemoRoute'

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
      // originRef.current && originRef.current.click()
    }
  }, [demoPauseOpen])
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
