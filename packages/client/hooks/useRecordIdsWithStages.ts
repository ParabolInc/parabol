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
          story {
            id
          }
        }
      }
    `,
      phaseRef
    )
    const {stages} = estimatePhase
    const usedRecordIds = new Set<string>()
    stages.forEach((stage) => {
      const {story} = stage
      const {id: storyId} = story
      usedRecordIds.add(storyId)
    })
    return usedRecordIds
  }, [phaseRef])
}

export default useRecordIdsWithStages
