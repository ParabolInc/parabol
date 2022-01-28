import useMutationProps from '../hooks/useMutationProps'
import {
  SetTaskEstimateMutationResponse,
  TaskEstimateInput
} from '../__generated__/SetTaskEstimateMutation.graphql'
import {SprintPokerDefaults} from '../types/constEnums'
import SetTaskEstimateMutation from '../mutations/SetTaskEstimateMutation'
import useAtmosphere from '../hooks/useAtmosphere'

const useSetTaskEstimate = () => {
  const {submitMutation, submitting, error, onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()

  const setTaskEstimate = (
    taskEstimate: TaskEstimateInput,
    stageId: string,
    onJiraFieldUpdateError?: () => void,
    onSuccess?: () => void
  ) => {
    const handleCompleted = (res: SetTaskEstimateMutationResponse, errors) => {
      onCompleted(res as any, errors)
      const {setTaskEstimate} = res
      const {error} = setTaskEstimate
      if (error?.message.includes(SprintPokerDefaults.JIRA_FIELD_UPDATE_ERROR)) {
        onJiraFieldUpdateError && onJiraFieldUpdateError()
      }
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
