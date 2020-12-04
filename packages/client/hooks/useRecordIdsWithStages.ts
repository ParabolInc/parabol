import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {readInlineData} from 'react-relay'
import {useRecordIdsWithStages_phase} from '../__generated__/useRecordIdsWithStages_phase.graphql'

const useRecordIdsWithStages = (phaseRef: any) => {
  return useMemo(() => {
    const estimatePhase = readInlineData<useRecordIdsWithStages_phase>(
      graphql`
      fragment useRecordIdsWithStages_phase on EstimatePhase @inline {
        stages {
          serviceTaskId
        }
      }
    `,
      phaseRef
    )
    const {stages} = estimatePhase
    const usedRecordIds = new Set<string>()
    stages.forEach((stage) => {
      const {serviceTaskId} = stage
      usedRecordIds.add(serviceTaskId)
    })
    return usedRecordIds
  }, [phaseRef])
}

export default useRecordIdsWithStages
