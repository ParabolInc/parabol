import {lazy, Suspense, useState} from 'react'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import lazyPreload from '~/utils/lazyPreload'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
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
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
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
        <TopBarHelpMenu
          dataCy='top-bar'
          menuProps={menuProps}
          toggleShortcuts={() => setIsShortcutsOpen((v) => !v)}
        />
      )}
      <Dialog isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)}>
        <DialogContent className='w-[564px] max-w-[95vw]' noClose>
          <Suspense fallback=''>
            <EditorHelpModal handleCloseModal={() => setIsShortcutsOpen(false)} />
          </Suspense>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TopBarHelp
