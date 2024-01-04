import React from 'react'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import lazyPreload from '~/utils/lazyPreload'
import TopBarIcon from './TopBarIcon'

const TopBarSettingsMenu = lazyPreload(() => import('./TopBarSettingsMenu'))

const TopBarSettings = () => {
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT
  )
  return (
    <>
      <TopBarIcon
        ref={originRef}
        onClick={togglePortal}
        onMouseEnter={TopBarSettingsMenu.preload}
        icon={'settings'}
        ariaLabel={'Settings menu'}
      />
      {menuPortal(<TopBarSettingsMenu dataCy='top-bar' menuProps={menuProps} />)}
    </>
  )
}

export default TopBarSettings
