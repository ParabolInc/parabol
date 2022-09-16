import {MutableRefObject, RefObject, useEffect} from 'react'
import {ElementWidth, Times} from '../types/constEnums'
import useFlip from './useFlip'
import useFlipDeal from './useFlipDeal'
import usePortal, {PortalId, PortalStatus} from './usePortal'

const shrinkGroupOnExpand = (groupEl: HTMLDivElement) => {
  const {style, scrollHeight} = groupEl
  style.transition = `height ${Times.REFLECTION_DROP_DURATION}ms, padding-bottom ${Times.REFLECTION_DROP_DURATION}ms`
  style.height = scrollHeight + 'px'
  requestAnimationFrame(() => {
    style.height = '0'
    style.padding = '0'
  })
}

const useExpandedReflections = (
  groupRef: MutableRefObject<any>,
  stackRef: RefObject<HTMLDivElement>,
  count: number,
  headerRef?: RefObject<HTMLDivElement>,
  portalParentId?: PortalId
) => {
  const offsetLeft = ElementWidth.REFLECTION_CARD_PADDING * 2
  const offsetTop = ElementWidth.REFLECTION_CARD_PADDING * 2
  const isGroup = !!headerRef
  const [bgRef, bgReverse] = useFlip({
    isBackground: true,
    firstRef: groupRef,
    isGroup
  })
  const [scrollRef, scrollReverse] = useFlip({
    firstRef: stackRef,
    offsetLeft,
    offsetTop,
    isGroup
  })
  const [modalHeaderRef, headerReverse] = useFlip({firstRef: headerRef, isGroup})
  const [setItemsRef, itemsReverse] = useFlipDeal(count)
  const {terminatePortal, openPortal, portal, portalStatus, setPortalStatus} = usePortal({
    parentId: portalParentId,
    id: 'expandedReflectionGroup',
    noClose: true
  })
  const collapse = () => {
    setPortalStatus(PortalStatus.Exiting)
    const {scrollHeight, style} = groupRef.current
    style.transition = `all ${Times.REFLECTION_COLLAPSE_DURATION}ms`
    requestAnimationFrame(() => {
      style.height = scrollHeight + offsetTop + 'px'
      style.padding = ''
      bgReverse()
      itemsReverse(count)
      scrollReverse()
      headerReverse()
      setTimeout(() => {
        terminatePortal()
        style.height = ''
        style.transition = ''
        style.paddingBottom = ''
      }, Times.REFLECTION_COLLAPSE_DURATION)
    })
  }
  const expand = () => {
    if (count <= 1) return
    openPortal()
    shrinkGroupOnExpand(groupRef.current)
  }
  useEffect(() => {
    if (count <= 1 && portalStatus !== PortalStatus.Exited) {
      collapse()
    }
  }, [count])
  return {
    bgRef,
    scrollRef,
    setItemsRef,
    modalHeaderRef,
    headerRef,
    portal,
    portalStatus,
    collapse,
    expand
  }
}

export default useExpandedReflections
