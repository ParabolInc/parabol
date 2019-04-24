import {useMemo, useRef} from 'react'
import getBBox from 'universal/components/RetroReflectPhase/getBBox'
import useLoadingDelay from 'universal/hooks/useLoadingDelay'
import useModalPortal from 'universal/hooks/useModalPortal'
import usePortal, {UsePortalOptions} from 'universal/hooks/usePortal'

interface Options extends UsePortalOptions {
  background?: string
  loadingWidth?: number
}

const useModal = (options: Options = {}) => {
  const {background, onOpen, onClose} = options
  const originRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLDivElement>(null)
  const {portal, closePortal, togglePortal, status} = usePortal({onOpen, onClose})
  const loadingWidth = useMemo(() => {
    if (options.loadingWidth) return options.loadingWidth
    const bbox = getBBox(originRef.current)
    return Math.max(40, bbox ? bbox.width : 40)
  }, [originRef.current])
  const {loadingDelay, loadingDelayRef} = useLoadingDelay()
  const modalPortal = useModalPortal(
    portal,
    targetRef,
    loadingWidth,
    status,
    loadingDelayRef,
    closePortal,
    background
  )
  return {togglePortal, originRef, modalPortal, closePortal, loadingDelay, loadingWidth}
}

export default useModal
