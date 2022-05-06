import {useMemo} from 'react'
import {Threshold} from '../types/constEnums'

const useUnusedRecords = (
  serviceTaskIds: string[],
  usedServiceTaskIds: Set<string>,
  thresh = Threshold.MAX_POKER_STORIES
): [string[], boolean | null] => {
  return useMemo(() => {
    const unusedServiceTaskIds = [] as string[]
    serviceTaskIds.forEach((servieTaskId) => {
      if (!usedServiceTaskIds.has(servieTaskId)) unusedServiceTaskIds.push(servieTaskId)
    })
    const allSelected =
      unusedServiceTaskIds.length === 0 || usedServiceTaskIds.size === thresh
        ? true
        : unusedServiceTaskIds.length === serviceTaskIds.length
        ? false
        : null
    return [unusedServiceTaskIds, allSelected]
  }, [serviceTaskIds, usedServiceTaskIds])
}

export default useUnusedRecords
