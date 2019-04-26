import {useRef} from 'react'
import useLoadingDelay from 'universal/hooks/useLoadingDelay'
import useModalPortal from 'universal/hooks/useModalPortal'
import usePortal, {UsePortalOptions} from 'universal/hooks/usePortal'

interface Options extends UsePortalOptions {
  background?: string
  loadingWidth?: number
}

const useModal = (options: Options = {}) => {
  const {background, onOpen, onClose} = options
  const targetRef = useRef<HTMLDivElement>(null)
  const {portal, closePortal, togglePortal, status} = usePortal({onOpen, onClose})
  const {loadingDelay, loadingDelayRef} = useLoadingDelay()
  const modalPortal = useModalPortal(
    portal,
    targetRef,
    status,
    loadingDelayRef,
    closePortal,
    background
  )
  return {togglePortal, modalPortal, closePortal, loadingDelay}
}

export default useModal
