import {lazy, Suspense, useState} from 'react'
import useHotkey from '../../hooks/useHotkey'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'

const EditorHelpModal = lazy(
  () =>
    import(
      /* webpackChunkName: 'EditorHelpModal' */ '../../components/EditorHelpModal/EditorHelpModal'
    )
)

const EditorHelpModalContainer = () => {
  const [isOpen, setIsOpen] = useState(false)
  useHotkey('?', () => setIsOpen((v) => !v))
  useHotkey('escape', () => setIsOpen(false))
  return (
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <DialogContent className='w-[564px] max-w-[95vw]' noClose>
        <Suspense fallback=''>
          <EditorHelpModal handleCloseModal={() => setIsOpen(false)} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}

export default EditorHelpModalContainer
