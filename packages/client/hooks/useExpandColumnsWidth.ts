import {RefObject, useLayoutEffect, useState} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {Breakpoint, ElementWidth} from '~/types/constEnums'
import useAtmosphere from './useAtmosphere'
import useBreakpoint from './useBreakpoint'
import useResizeObserver from './useResizeObserver'

const useExpandColumnsWidth = (
  phaseRef: RefObject<HTMLDivElement>,
  reflectPromptsCount: number,
  reflectPrompts
) => {
  const atmosphere = useAtmosphere()
  const phaseBBox = phaseRef.current?.getBoundingClientRect()
  const width = phaseBBox?.width
  useLayoutEffect(() => {
    commitLocalUpdate(atmosphere, (store) => {
      const isWidthExpanded =
        width &&
        reflectPromptsCount * ElementWidth.REFLECTION_CARD +
          ElementWidth.REFLECTION_CARD_PADDING * 2 <
          width
      reflectPrompts.forEach((prompt) => {
        const reflectPrompt = store.get(prompt.id)
        reflectPrompt?.setValue(isWidthExpanded, 'isWidthExpanded')
      })
    })
  }, [width])

  // useLayoutEffect(adjustLeft, [estimateAreaRef])
  // useResizeObserver(adjustLeft, estimateAreaRef)
}

export default useExpandColumnsWidth
