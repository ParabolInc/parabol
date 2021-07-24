import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {readInlineData} from 'react-relay'
import {useGetUsedServiceTaskIds_phase} from '../__generated__/useGetUsedServiceTaskIds_phase.graphql'

const useGetUsedServiceTaskIds = (phaseRef: any) => {
  return useMemo(() => {
    const estimatePhase = readInlineData<useGetUsedServiceTaskIds_phase>(
      graphql`
        fragment useGetUsedServiceTaskIds_phase on EstimatePhase @inline {
          stages {
            serviceTaskId
            taskId
            story {
              ... on Task {
                __typename
                id
                integrationHash
              }
            }
          }
        }
      `,
      phaseRef
    )
    const {stages} = estimatePhase
    const usedServiceTaskIds = new Set<string>()
    stages.forEach((stage) => {
      const {serviceTaskId, story, taskId} = stage
      if (!taskId) {
        // this is a legacy story
        usedServiceTaskIds.add(serviceTaskId)
      } else {
        if (story?.__typename === 'Task') {
          const {id: taskId, integrationHash} = story
          // a new serviceTaskId uniquely identifies an issue that doesn't exist in our system yet (integrationHash)
          // if it's a vanilla parabol task, then we just use that
          usedServiceTaskIds.add(integrationHash ?? taskId)
        }
      }
    })
    return usedServiceTaskIds
  }, [phaseRef])
}

export default useGetUsedServiceTaskIds
