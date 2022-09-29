import React, {lazy} from 'react'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import useModal from '~/hooks/useModal'
import lazyPreload from '~/utils/lazyPreload'
import TopBarIcon from './TopBarIcon'

const TopBarHelpMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TopBarHelpMenu' */
      './TopBarHelpMenu'
    )
)

const EditorHelpModal = lazy(
  () => import(/* webpackChunkName: 'EditorHelpModal' */ './EditorHelpModal/EditorHelpModal')
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
        ariaLabel={'Help menu'}
      />
      {menuPortal(
        <TopBarHelpMenu dataCy='top-bar' menuProps={menuProps} toggleShortcuts={toggleShortcuts} />
      )}
      {modalPortal(<EditorHelpModal handleCloseModal={closeShortcuts} />)}
    </>
  )
}

export default TopBarHelp
