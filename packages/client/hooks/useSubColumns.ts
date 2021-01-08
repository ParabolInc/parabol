import {RefObject, useLayoutEffect, useMemo, useState} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {Breakpoint, ElementHeight, ElementWidth} from '~/types/constEnums'
import useBreakpoint from './useBreakpoint'
import useAtmosphere from './useAtmosphere'
import {GroupingKanbanColumn_reflectionGroups} from '~/__generated__/GroupingKanbanColumn_reflectionGroups.graphql'
import useSortNewReflectionGroup from './useSortNewReflectionGroup'

const DEFAULT_SUB_COLUMNS = 2

const useSubColumns = (
  columnBodyRef: RefObject<HTMLDivElement>,
  phaseRef: RefObject<HTMLDivElement>,
  reflectPromptsCount: number,
  reflectionGroups: GroupingKanbanColumn_reflectionGroups
): [boolean, number, number[], () => void] => {
  const [isWidthExpanded, setIsWidthExpanded] = useState(false)
  const [subColumnCount, setSubColumnCount] = useState(DEFAULT_SUB_COLUMNS)
  useSortNewReflectionGroup(isWidthExpanded, subColumnCount, reflectionGroups)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const atmosphere = useAtmosphere()
  const subColumnIndexes = useMemo(
    () => (isWidthExpanded ? [...Array(subColumnCount).keys()] : [0]),
    [isWidthExpanded, subColumnCount]
  )

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

  const getMaxSubColumns = () => {
    const columnBodyEl = columnBodyRef.current
    if (!columnBodyEl) return DEFAULT_SUB_COLUMNS
    return Math.ceil(
      columnBodyEl.scrollHeight / (columnBodyEl.clientHeight - ElementHeight.REFLECTION_CARD)
    )
  }

  const toggleWidth = () => {
    const maxSubColumns = getMaxSubColumns()
    setSubColumnCount(maxSubColumns)
    sortSubColumns(maxSubColumns)
    setIsWidthExpanded(!isWidthExpanded)
  }

  const setInitialSubColumnCount = () => {
    if (!isDesktop && isWidthExpanded) {
      setIsWidthExpanded(false)
      return
    }
    const phaseEl = phaseRef.current
    if (phaseEl) {
      const {clientWidth} = phaseEl
      const maxSubColumnsInPhase = Math.floor(clientWidth / ElementWidth.REFLECTION_COLUMN)
      const newSubColumnCount = Math.floor(maxSubColumnsInPhase / reflectPromptsCount)
      if (newSubColumnCount > 1) {
        setIsWidthExpanded(true)
        setSubColumnCount(newSubColumnCount)
      }
    }
  }
  useLayoutEffect(() => {
    setInitialSubColumnCount()
    sortSubColumns(subColumnCount)
  }, [phaseRef.current])

  return [isWidthExpanded, subColumnCount, subColumnIndexes, toggleWidth]
}

export default useSubColumns
