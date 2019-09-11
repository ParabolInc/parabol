import useFlip from './useFlip'
import {ElementWidth, Times} from '../types/constEnums'
import useFlipDeal from './useFlipDeal'
import usePortal, {PortalStatus} from './usePortal'
import {MutableRefObject, RefObject, useEffect} from 'react'

const useExpandedReflections = (stackRef: MutableRefObject<any>, count: number, headerRef?: RefObject<HTMLDivElement>) => {
  const offsetLeft = ElementWidth.REFLECTION_CARD_PADDING * 2
  // headerRef exists for grouping phase, which needs 8 fewer pixels offset
  const offsetTop = ElementWidth.REFLECTION_CARD_PADDING * (headerRef ? 1 : 2)

  const [bgRef, bgReverse] = useFlip({
    isBackground: true,
    firstRef: stackRef,
    offsetLeft,
    offsetTop
  })
  const [scrollRef, scrollReverse] = useFlip({
    firstRef: stackRef,
    offsetLeft,
    offsetTop
  })
  const [modalHeaderRef, headerReverse] = useFlip({firstRef: headerRef})
  const [setItemsRef, itemsReverse] = useFlipDeal(count)
  const {terminatePortal, openPortal, portal, portalStatus, setPortalStatus} = usePortal()
  const collapse = () => {
    setPortalStatus(PortalStatus.Exiting)
    setTimeout(() => {
      bgReverse()
      itemsReverse()
      scrollReverse()
      headerReverse()
      setTimeout(terminatePortal, Times.REFLECTION_DEAL_CARD_DURATION)
    })
  }
  const expand = () => {
    if (count <= 1) return
    openPortal()
  }
  useEffect(() => {
    if (count <= 1 && portalStatus !== PortalStatus.Exited) {
      collapse()
    }
  }, [count])
  return {bgRef, scrollRef, setItemsRef, modalHeaderRef, portal, portalStatus, collapse, expand}
}

export default useExpandedReflections
