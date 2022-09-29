import React, {lazy, Suspense} from 'react'
import useHotkey from '../../hooks/useHotkey'
import useModal from '../../hooks/useModal'

const EditorHelpModal = lazy(
  () =>
    import(
      /* webpackChunkName: 'EditorHelpModal' */ '../../components/EditorHelpModal/EditorHelpModal'
    )
)

const EditorHelpModalContainer = () => {
  const {togglePortal, closePortal, modalPortal} = useModal()
  useHotkey('?', togglePortal as any)
  useHotkey('escape', closePortal)
  return (
    <Suspense fallback={''}>
      {modalPortal(<EditorHelpModal handleCloseModal={closePortal} />)}
    </Suspense>
  )
}

export default EditorHelpModalContainer
