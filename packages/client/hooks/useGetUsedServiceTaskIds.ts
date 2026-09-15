import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {readInlineData} from 'react-relay'
import type {useGetUsedServiceTaskIds_phase$key} from '../__generated__/useGetUsedServiceTaskIds_phase.graphql'

const useGetUsedServiceTaskIds = (
  phaseRef: useGetUsedServiceTaskIds_phase$key
): ReadonlySet<string> => {
  return useMemo(() => {
    const estimatePhase = readInlineData(
      graphql`
        fragment useGetUsedServiceTaskIds_phase on EstimatePhase @inline {
          stages {
            serviceTaskId
          }
        }
      `,
      phaseRef
    )
    return new Set(estimatePhase.stages.map(({serviceTaskId}) => serviceTaskId))
  }, [phaseRef])
}

export default useGetUsedServiceTaskIds
