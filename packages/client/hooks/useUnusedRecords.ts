import {useMemo} from 'react'
import {Threshold} from '~/types/constEnums'

const useUnusedRecords = (
  serviceTaskIds: string[],
  usedServiceTaskIds: Set<string>
): [string[], boolean | null] => {
  return useMemo(() => {
    const unusedServiceTaskIds = [] as string[]
    serviceTaskIds.forEach((servieTaskId) => {
      if (!usedServiceTaskIds.has(servieTaskId)) unusedServiceTaskIds.push(servieTaskId)
    })
    const allSelected =
      unusedServiceTaskIds.length === 0 || usedServiceTaskIds.size === Threshold.MAX_POKER_STORIES
        ? true
        : unusedServiceTaskIds.length === serviceTaskIds.length
        ? false
        : null
    return [unusedServiceTaskIds, allSelected]
  }, [serviceTaskIds, usedServiceTaskIds])
}

export default useUnusedRecords
