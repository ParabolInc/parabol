import {useMemo} from 'react'
import {Threshold} from '../types/constEnums'

const useUnusedRecords = (
  serviceTaskIds: string[],
  usedServiceTaskIds: Set<string>,
  thresh?: number
): [string[], boolean | null] => {
  return useMemo(() => {
    const unusedServiceTaskIds = [] as string[]
    serviceTaskIds.forEach((servieTaskId) => {
      if (!usedServiceTaskIds.has(servieTaskId)) unusedServiceTaskIds.push(servieTaskId)
    })
    const maxStories = thresh ? thresh : Threshold.MAX_POKER_STORIES
    const allSelected =
      unusedServiceTaskIds.length === 0 || usedServiceTaskIds.size === maxStories
        ? true
        : unusedServiceTaskIds.length === serviceTaskIds.length
        ? false
        : null
    return [unusedServiceTaskIds, allSelected]
  }, [serviceTaskIds, usedServiceTaskIds])
}

export default useUnusedRecords
