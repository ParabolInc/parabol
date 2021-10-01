import {MAX_GROUPS_HEIGHT_PERC} from '../components/SpotlightGroups'
import {ElementHeight} from '~/types/constEnums'
import {RefObject, useLayoutEffect, useState} from 'react'
import useResizeObserver from './useResizeObserver'

const useSpotlightGroupsHeight = (
  groupsRef: RefObject<HTMLDivElement>,
  columnsRef: RefObject<HTMLDivElement>
) => {
  const [height, setHeight] = useState<number | string>(`${MAX_GROUPS_HEIGHT_PERC}%`)

  const getHeight = () => {
    const {current: groupsEl} = groupsRef
    const {current: columnsEl} = columnsRef
    if (!groupsEl || !columnsEl) return
    const {clientHeight: columnsHeight} = columnsEl
    const {clientHeight: groupsHeight} = groupsEl
    // if (!columnsHeight || !groupsHeight) return
    if (!columnsHeight || !groupsHeight || columnsHeight < 20) return
    // make sure there's space in the scrollbar for a large reflection group to be added
    const groupsPadding = 48 + 24
    const maxGroupsHeight = columnsHeight + ElementHeight.REFLECTION_GROUP_MAX + groupsPadding
    // groupsHeight is too big. reduce the height so there's less whitespace
    if (maxGroupsHeight < groupsHeight) {
      setHeight(maxGroupsHeight)
    }
  }

  useLayoutEffect(getHeight, [groupsRef, columnsRef])
  useResizeObserver(getHeight, columnsRef)
  return height
}

export default useSpotlightGroupsHeight
