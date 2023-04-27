import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import SetTaskEstimateMutation from '../mutations/SetTaskEstimateMutation'
import {CompletedHandler} from '../types/relayMutations'
import {
  SetTaskEstimateMutation as TSetTaskEstimateMutation,
  TaskEstimateInput
} from '../__generated__/SetTaskEstimateMutation.graphql'

const useSetTaskEstimate = () => {
  const {submitMutation, submitting, error, onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()

  const setTaskEstimate = (
    taskEstimate: TaskEstimateInput,
    stageId: string,
    onSuccess?: () => void
  ) => {
    const handleCompleted: CompletedHandler = (
      res: TSetTaskEstimateMutation['response'],
      errors
    ) => {
      onCompleted(res as any, errors)
      const {setTaskEstimate} = res
      const {error} = setTaskEstimate
      if (!error) {
        onSuccess && onSuccess()
      }
    }

    submitMutation()

    SetTaskEstimateMutation(
      atmosphere,
      {taskEstimate},
      {onError, onCompleted: handleCompleted, stageId}
    )
  }

  return {setTaskEstimate, error, submitting, onError, onCompleted}
}

export default useSetTaskEstimate
