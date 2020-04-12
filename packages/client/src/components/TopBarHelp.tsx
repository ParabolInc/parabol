import {MenuPosition} from 'parabol-client/src/hooks/useCoords'
import useMenu from 'parabol-client/src/hooks/useMenu'
import useModal from 'parabol-client/src/hooks/useModal'
import React, {lazy} from 'react'
import lazyPreload from 'parabol-client/src/utils/lazyPreload'
import TopBarIcon from './TopBarIcon'

const TopBarHelpMenu = lazyPreload(() =>
  import(
    /* webpackChunkName: 'TopBarHelpMenu' */
    './TopBarHelpMenu'
  )
)

const EditorHelpModal = lazy(() =>
  import(/* webpackChunkName: 'EditorHelpModal' */ './EditorHelpModal/EditorHelpModal')
)

const TopBarHelp = () => {
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT
  )
  const {togglePortal: toggleShortcuts, closePortal: closeShortcuts, modalPortal} = useModal()
  return (
    <>
      <TopBarIcon
        ref={originRef}
        onClick={togglePortal}
        onMouseEnter={TopBarHelpMenu.preload}
        icon={'help_outline'}
      />
      {menuPortal(<TopBarHelpMenu menuProps={menuProps} toggleShortcuts={toggleShortcuts} />)}
      {modalPortal(<EditorHelpModal handleCloseModal={closeShortcuts} />)}
    </>
  )
}

export default TopBarHelp
