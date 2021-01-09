import {RefObject, useLayoutEffect, useMemo, useState} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {ElementHeight, ElementWidth} from '~/types/constEnums'
import useAtmosphere from './useAtmosphere'
import {GroupingKanbanColumn_reflectionGroups} from '~/__generated__/GroupingKanbanColumn_reflectionGroups.graphql'
import useSortNewReflectionGroup from './useSortNewReflectionGroup'

const DEFAULT_EXPANDED_SUB_COLUMNS = 2
const DEFAULT_SUB_COLUMNS = 1

const useSubColumns = (
  columnBodyRef: RefObject<HTMLDivElement>,
  phaseRef: RefObject<HTMLDivElement>,
  reflectPromptsCount: number,
  reflectionGroups: GroupingKanbanColumn_reflectionGroups
): [boolean, number, number[], () => void] => {
  const [subColumnCount, setSubColumnCount] = useState(DEFAULT_SUB_COLUMNS)
  const atmosphere = useAtmosphere()
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
    const columnBodyEl = columnBodyRef.current
    if (!columnBodyEl) return DEFAULT_EXPANDED_SUB_COLUMNS
    const maxSubColumnCount = Math.ceil(
      columnBodyEl.scrollHeight / (columnBodyEl.clientHeight - ElementHeight.REFLECTION_CARD)
    )
    return Math.max(maxSubColumnCount, DEFAULT_EXPANDED_SUB_COLUMNS)
  }

  const toggleWidth = () => {
    const maxSubColumnCount = getMaxSubColumnCount()
    if (subColumnCount === 1) {
      setSubColumnCount(maxSubColumnCount)
      sortSubColumns(maxSubColumnCount)
    } else setSubColumnCount(1)
  }

  const getInitialSubColumnCount = () => {
    const phaseEl = phaseRef.current
    if (!phaseEl) return DEFAULT_SUB_COLUMNS
    const {clientWidth} = phaseEl
    const maxSubColumnsInPhase = Math.floor(clientWidth / ElementWidth.REFLECTION_COLUMN)
    const newSubColumnCount = Math.floor(maxSubColumnsInPhase / reflectPromptsCount)
    return newSubColumnCount
  }
  useLayoutEffect(() => {
    const initialSubColumnCount = getInitialSubColumnCount()
    setSubColumnCount(initialSubColumnCount)
    sortSubColumns(initialSubColumnCount)
  }, [phaseRef.current])

  return [subColumnCount > 1, subColumnCount, subColumnIndexes, toggleWidth]
}

export default useSubColumns
