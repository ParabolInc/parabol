import useFlip from './useFlip'
import {ElementWidth, Times} from '../types/constEnums'
import useFlipDeal from './useFlipDeal'
import usePortal from './usePortal'
import {MutableRefObject, useEffect} from 'react'

const useExpandedReflections = (firstRef: MutableRefObject<any>, count: number) => {
  const [bgRef, bgReverse] = useFlip({isBackground: true, firstRef, padding: ElementWidth.REFLECTION_CARD_PADDING * 2})
  const [scrollRef, scrollReverse] = useFlip({firstRef, padding: ElementWidth.REFLECTION_CARD_PADDING * 2})
  const [setItemsRef, itemsReverse] = useFlipDeal(count)
  const {terminatePortal, openPortal, portal} = usePortal()
  const collapse = () => {
    itemsReverse()
    bgReverse()
    scrollReverse()
    setTimeout(terminatePortal, Times.REFLECTION_DEAL_CARD_DURATION)
  }
  const expand = () => {
    if (count <= 1) return
    openPortal()
  }
  useEffect(() => {
    if (count <= 1) {
      collapse()
    }
  }, [count])
  return {bgRef, scrollRef, setItemsRef, portal, collapse, expand}
}

export default useExpandedReflections
