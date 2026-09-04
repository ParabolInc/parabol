import {type MutableRefObject, type ReactNode, type RefObject, useEffect} from 'react'
import {createPortal} from 'react-dom'
import requestDoubleAnimationFrame from '../components/RetroReflectPhase/requestDoubleAnimationFrame'
import {ElementWidth, Times} from '../types/constEnums'
import useFlip from './useFlip'
import useFlipDeal from './useFlipDeal'
import {PortalStatus} from './usePortal'
import useRefState from './useRefState'

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
  headerRef?: RefObject<HTMLDivElement>
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
  const [modalHeaderRef, headerReverse] = useFlip({
    firstRef: headerRef,
    isGroup
  })
  const [setItemsRef, itemsReverse] = useFlipDeal(count)
  const [portalStatusRef, setPortalStatus] = useRefState(PortalStatus.Exited)
  const portalStatus = portalStatusRef.current
  const portal = (reactEl: ReactNode) =>
    portalStatus === PortalStatus.Exited ? null : createPortal(reactEl, document.body)
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
        setPortalStatus(PortalStatus.Exited)
        style.height = ''
        style.transition = ''
        style.paddingBottom = ''
      }, Times.REFLECTION_COLLAPSE_DURATION)
    })
  }
  const expand = () => {
    if (count <= 1) return
    if (portalStatusRef.current === PortalStatus.Exiting) {
      setPortalStatus(PortalStatus.Entered)
    } else if (portalStatusRef.current === PortalStatus.Exited) {
      setPortalStatus(PortalStatus.Mounted)
      // without rDAF the FLIP coords haven't had time to flush
      requestDoubleAnimationFrame(() => {
        setPortalStatus(PortalStatus.Entering)
      })
    }
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
