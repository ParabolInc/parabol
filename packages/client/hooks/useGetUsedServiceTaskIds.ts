import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {readInlineData} from 'react-relay'
import {useGetUsedServiceTaskIds_phase$key} from '../__generated__/useGetUsedServiceTaskIds_phase.graphql'

const useGetUsedServiceTaskIds = (phaseRef: useGetUsedServiceTaskIds_phase$key) => {
  return useMemo(() => {
    const estimatePhase = readInlineData(
      graphql`
        fragment useGetUsedServiceTaskIds_phase on EstimatePhase @inline {
          stages {
            taskId
            task {
              integrationHash
            }
          }
        }
      `,
      phaseRef
    )
    const {stages} = estimatePhase
    const usedServiceTaskIds = new Set<string>()
    stages.forEach((stage) => {
      const {task, taskId} = stage
      const serviceTaskId = task?.integrationHash ?? taskId
      // a new serviceTaskId uniquely identifies an issue that doesn't exist in our system yet (integrationHash)
      usedServiceTaskIds.add(serviceTaskId)
    })
    return usedServiceTaskIds
  }, [phaseRef])
}

export default useGetUsedServiceTaskIds
