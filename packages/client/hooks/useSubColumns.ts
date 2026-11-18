import {type RefObject, useMemo, useState} from 'react'
import {commitLocalUpdate} from 'react-relay'
import type {GroupingKanbanColumn_reflectionGroups$data} from '~/__generated__/GroupingKanbanColumn_reflectionGroups.graphql'
import getBBox from '~/components/RetroReflectPhase/getBBox'
import {Breakpoint, ElementWidth, MeetingControlBarEnum} from '~/types/constEnums'
import useAtmosphere from './useAtmosphere'
import useBreakpoint from './useBreakpoint'
import useResizeObserver from './useResizeObserver'
import useSortNewReflectionGroup from './useSortNewReflectionGroup'

const DEFAULT_EXPANDED_SUB_COLUMNS = 2
const DEFAULT_SUB_COLUMNS = 1
const COLUMN_MARGIN = 16
const COLUMN_WIDTH = ElementWidth.REFLECTION_COLUMN + COLUMN_MARGIN
const EXPANDED_SUB_COLUMN_VERTICAL_PADDING = 24

const getFewestSubColumnsWithoutVerticalScroll = (
  groupHeights: number[],
  availableHeight: number
) => {
  for (let subColumnCount = 1; subColumnCount < groupHeights.length; subColumnCount++) {
    const subColumnHeights = new Array<number>(subColumnCount).fill(0)
    groupHeights.forEach((groupHeight, idx) => {
      subColumnHeights[idx % subColumnCount]! += groupHeight
    })
    if (Math.max(...subColumnHeights) <= availableHeight) return subColumnCount
  }
  return groupHeights.length
}

const useSubColumns = (
  columnScrollRef: RefObject<HTMLDivElement | null>,
  phaseRef: RefObject<HTMLDivElement | null>,
  reflectPromptsCount: number,
  reflectionGroups: GroupingKanbanColumn_reflectionGroups$data,
  columnsRef: RefObject<HTMLDivElement | null>
) => {
  const atmosphere = useAtmosphere()
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
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

  const [subColumnCount, setSubColumnCount] = useState(() => {
    const phaseBBox = getBBox(phaseRef.current)
    if (!phaseBBox || !isDesktop) return DEFAULT_SUB_COLUMNS
    const {width: phaseWidth} = phaseBBox
    const maxSubColumnsInPhase = Math.floor(phaseWidth! / COLUMN_WIDTH)
    const maxSubColumnsPerColumn = Math.max(
      Math.floor(maxSubColumnsInPhase / reflectPromptsCount),
      DEFAULT_SUB_COLUMNS
    )
    const initialSubColumnCount = Math.min(DEFAULT_EXPANDED_SUB_COLUMNS, maxSubColumnsPerColumn)
    sortSubColumns(initialSubColumnCount)
    return initialSubColumnCount
  })
  const subColumnIndexes = useMemo(() => {
    return [...Array(subColumnCount).keys()]
  }, [subColumnCount])

  useSortNewReflectionGroup(subColumnCount, subColumnIndexes, reflectionGroups)

  const getExpandedSubColumnCount = () => {
    const columnsEl = columnsRef.current
    const kanbanScrollEl = columnsEl?.parentElement
    const columnScrollEl = columnScrollRef.current
    if (!columnsEl || !kanbanScrollEl || !columnScrollEl) return DEFAULT_EXPANDED_SUB_COLUMNS
    const spareWidth = kanbanScrollEl.clientWidth - columnsEl.offsetWidth
    const subColumnCountThatFits =
      subColumnCount + Math.floor(spareWidth / ElementWidth.REFLECTION_COLUMN)
    const groupHeights = Array.from(columnScrollEl.children).flatMap((subColumnEl) =>
      Array.from(subColumnEl.children, (groupEl) => groupEl.getBoundingClientRect().height)
    )
    // a wider column can end up under the control bar, which shortens it by COVER_HEIGHT
    const columnShortening =
      columnsEl.getBoundingClientRect().bottom - columnScrollEl.getBoundingClientRect().bottom
    const availableHeight =
      columnScrollEl.clientHeight -
      (MeetingControlBarEnum.COVER_HEIGHT - columnShortening) -
      EXPANDED_SUB_COLUMN_VERTICAL_PADDING
    const subColumnCountWithoutVerticalScroll = getFewestSubColumnsWithoutVerticalScroll(
      groupHeights,
      availableHeight
    )
    return Math.max(
      Math.min(subColumnCountThatFits, subColumnCountWithoutVerticalScroll),
      DEFAULT_EXPANDED_SUB_COLUMNS
    )
  }

  const toggleWidth = () => {
    if (subColumnCount === DEFAULT_SUB_COLUMNS) {
      const expandedSubColumnCount = getExpandedSubColumnCount()
      setSubColumnCount(expandedSubColumnCount)
      sortSubColumns(expandedSubColumnCount)
    } else setSubColumnCount(DEFAULT_SUB_COLUMNS)
  }

  useResizeObserver(() => {
    if (!isDesktop) {
      setSubColumnCount(DEFAULT_SUB_COLUMNS)
    }
  }, phaseRef)

  return [subColumnCount > DEFAULT_SUB_COLUMNS, subColumnIndexes, toggleWidth] as const
}

export default useSubColumns
