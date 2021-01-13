import {RefObject, useLayoutEffect, useMemo, useState} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {Breakpoint, ElementHeight, ElementWidth} from '~/types/constEnums'
import useAtmosphere from './useAtmosphere'
import {GroupingKanbanColumn_reflectionGroups} from '~/__generated__/GroupingKanbanColumn_reflectionGroups.graphql'
import useSortNewReflectionGroup from './useSortNewReflectionGroup'
import useBreakpoint from './useBreakpoint'
import useResizeObserver from './useResizeObserver'
import getBBox from '~/components/RetroReflectPhase/getBBox'

const DEFAULT_EXPANDED_SUB_COLUMNS = 2
const DEFAULT_SUB_COLUMNS = 1

const useSubColumns = (
  columnBodyRef: RefObject<HTMLDivElement>,
  phaseRef: RefObject<HTMLDivElement>,
  reflectPromptsCount: number,
  reflectionGroups: GroupingKanbanColumn_reflectionGroups,
  columnsRef: RefObject<HTMLDivElement>
) => {
  const [subColumnCount, setSubColumnCount] = useState(DEFAULT_SUB_COLUMNS)
  const atmosphere = useAtmosphere()
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)

  const subColumnIndexes = useMemo(() => {
    return [...Array(subColumnCount).keys()]
  }, [subColumnCount])
  useSortNewReflectionGroup(subColumnCount, subColumnIndexes, reflectionGroups)

  const sortSubColumns = (maxSubColumns: number) => {
    commitLocalUpdate(atmosphere, (store) => {
      let nextSubColumnIdx = 0
      reflectionGroups.forEach((group) => {
        const reflectionGroup = store.get(group.id)
        if (!reflectionGroup) return
        reflectionGroup.setValue(nextSubColumnIdx, 'subColumnIdx')
        if (nextSubColumnIdx === maxSubColumns - 1) nextSubColumnIdx = 0
        else nextSubColumnIdx += 1
      })
    })
  }

  const getMaxSubColumnCount = () => {
    if (!columnBodyRef?.current || !columnsRef?.current || !phaseRef?.current)
      return DEFAULT_EXPANDED_SUB_COLUMNS
    const columnBodyEl = columnBodyRef.current
    const subColumnCountWithoutScroll = Math.ceil(
      columnBodyEl.scrollHeight / (columnBodyEl.clientHeight - ElementHeight.REFLECTION_CARD)
    )
    const maxSubColumnCount = Math.max(subColumnCountWithoutScroll, DEFAULT_EXPANDED_SUB_COLUMNS)
    const currentlyTakenWidth = columnsRef.current.clientWidth
    const phaseWidth = phaseRef.current.clientWidth
    const scrollbarExists = phaseWidth < currentlyTakenWidth
    if (!scrollbarExists) {
      const newColumnWidth = ElementWidth.REFLECTION_COLUMN * maxSubColumnCount
      const scrollbarWillExist =
        currentlyTakenWidth + newColumnWidth - subColumnCount * ElementWidth.REFLECTION_COLUMN >
        phaseWidth
      // if expanding to maxWidth creates a horizontal scrollbar, check if DEFAULT_EXPANDED_SUB_COLUMNS does not
      if (scrollbarWillExist) {
        const newColumnWidth = ElementWidth.REFLECTION_COLUMN * DEFAULT_EXPANDED_SUB_COLUMNS
        const scrollbarWillStillExist =
          currentlyTakenWidth + newColumnWidth - subColumnCount * ElementWidth.REFLECTION_COLUMN >
          phaseWidth
        if (!scrollbarWillStillExist) return DEFAULT_EXPANDED_SUB_COLUMNS
      }
    }
    return maxSubColumnCount
  }

  const toggleWidth = () => {
    const maxSubColumnCount = getMaxSubColumnCount()
    if (subColumnCount === DEFAULT_SUB_COLUMNS) {
      setSubColumnCount(maxSubColumnCount)
      sortSubColumns(maxSubColumnCount)
    } else setSubColumnCount(DEFAULT_SUB_COLUMNS)
  }

  const getInitialSubColumnCount = () => {
    const phaseBBox = getBBox(phaseRef.current)
    if (!phaseBBox) return DEFAULT_SUB_COLUMNS
    const {width: phaseWidth} = phaseBBox
    const maxSubColumnsInPhase = Math.floor(phaseWidth! / ElementWidth.REFLECTION_COLUMN)
    const maxSubColumnsPerColumn = Math.max(
      Math.floor(maxSubColumnsInPhase / reflectPromptsCount),
      DEFAULT_SUB_COLUMNS
    )
    const maxSubColumnCount = getMaxSubColumnCount()
    return Math.min(maxSubColumnCount, maxSubColumnsPerColumn)
  }

  useLayoutEffect(() => {
    if (!phaseRef?.current) return
    const initialSubColumnCount = getInitialSubColumnCount()
    setSubColumnCount(initialSubColumnCount)
    if (initialSubColumnCount > 1) {
      sortSubColumns(initialSubColumnCount)
    }
  }, [phaseRef?.current])

  useResizeObserver(() => {
    if (!isDesktop && subColumnCount > DEFAULT_SUB_COLUMNS) {
      setSubColumnCount(DEFAULT_SUB_COLUMNS)
    }
  }, phaseRef)

  return [
    subColumnCount > DEFAULT_SUB_COLUMNS,
    subColumnCount,
    subColumnIndexes,
    toggleWidth
  ] as const
}

export default useSubColumns
