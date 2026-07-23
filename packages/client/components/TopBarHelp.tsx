import {lazy, Suspense, useState} from 'react'
import lazyPreload from '~/utils/lazyPreload'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {Menu} from '../ui/Menu/Menu'
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
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  return (
    <>
      <Menu
        trigger={
          <TopBarIcon
            onMouseEnter={TopBarHelpMenu.preload}
            icon={'help_outline'}
            ariaLabel={'Help menu'}
          />
        }
      >
        <Suspense fallback={null}>
          <TopBarHelpMenu toggleShortcuts={() => setIsShortcutsOpen((v) => !v)} />
        </Suspense>
      </Menu>
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
