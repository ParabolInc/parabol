import type {Editor} from '@tiptap/core'
import {type RefObject, useEffect, useLayoutEffect, useRef, useState} from 'react'
import useEventCallback from '../../../hooks/useEventCallback'
import {isEqualWhenSerialized} from '../../../shared/isEqualWhenSerialized'
import {layoutThreadCards} from './layoutThreadCards'

export const DRAFT_CARD_ID = 'draft'
const CARD_GAP = 12
const FLOATING_CARD_OFFSET = 8

export const getPageThreadAnchors = (editor: Editor, cardId: string) => {
  const selector =
    cardId === DRAFT_CARD_ID
      ? '[data-page-comment-draft]'
      : `[data-thread-id="${CSS.escape(cardId)}"]`
  return [...editor.view.dom.querySelectorAll(selector)]
}

interface Options {
  editor: Editor
  layerRef: RefObject<HTMLDivElement>
  cardIds: string[]
  activeCardId: string | null
  // true to put every card in the margin next to its text, false to float only the active card below its text
  isRailLayout: boolean
}

export const usePageThreadLayout = (options: Options) => {
  const {editor, layerRef, cardIds, activeCardId, isRailLayout} = options
  const cardElementsRef = useRef(new Map<string, HTMLElement>())
  const resizeObserverRef = useRef<ResizeObserver>()
  const [tops, setTops] = useState<Record<string, number>>({})

  const measure = () => {
    const layer = layerRef.current
    if (!layer || editor.isDestroyed) return
    const layerTop = layer.getBoundingClientRect().top
    const visibleCardIds = isRailLayout ? cardIds : cardIds.filter((id) => id === activeCardId)
    const cards = visibleCardIds.flatMap((id) => {
      const anchors = getPageThreadAnchors(editor, id)
      const cardElement = cardElementsRef.current.get(id)
      if (anchors.length === 0 || !cardElement) return []
      const anchorTop = isRailLayout
        ? anchors[0]!.getBoundingClientRect().top
        : anchors.at(-1)!.getBoundingClientRect().bottom + FLOATING_CARD_OFFSET
      return [{id, anchorTop: anchorTop - layerTop, height: cardElement.offsetHeight}]
    })
    const nextTops = layoutThreadCards(cards, activeCardId, CARD_GAP)
    setTops((prevTops) => (isEqualWhenSerialized(prevTops, nextTops) ? prevTops : nextTops))
  }
  const measureLatest = useEventCallback(measure)

  // A card is hidden until it has a position, and a hidden composer can't take focus,
  // so the cards are positioned before anything else gets to run
  useLayoutEffect(measure)

  useEffect(() => {
    let frame = 0
    const scheduleMeasure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measureLatest)
    }
    const resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserverRef.current = resizeObserver
    resizeObserver.observe(editor.view.dom)
    cardElementsRef.current.forEach((cardElement) => resizeObserver.observe(cardElement))
    editor.on('transaction', scheduleMeasure)
    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      editor.off('transaction', scheduleMeasure)
    }
  }, [editor])

  const setCardElement = (cardId: string, cardElement: HTMLElement | null) => {
    const prevCardElement = cardElementsRef.current.get(cardId)
    if (prevCardElement === cardElement) return
    if (prevCardElement) resizeObserverRef.current?.unobserve(prevCardElement)
    if (cardElement) {
      cardElementsRef.current.set(cardId, cardElement)
      resizeObserverRef.current?.observe(cardElement)
    } else {
      cardElementsRef.current.delete(cardId)
    }
  }

  return {tops, setCardElement}
}
