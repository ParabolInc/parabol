import {useCallback, useState} from 'react'
import type {
  TaskEstimateInput,
  SetTaskEstimateMutation as TSetTaskEstimateMutation
} from '../__generated__/SetTaskEstimateMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import SetTaskEstimateMutation from '../mutations/SetTaskEstimateMutation'
import type {CompletedHandler} from '../types/relayMutations'
import {MAX_FREE_JIRA_EXPORTS} from '../utils/constants'
import getMutationError from '../utils/relay/getMutationError'
import setStorageItem from '../utils/setStorageItem'

export const JIRA_EXPORT_UPGRADE_MODAL_DISMISSED_KEY = 'jiraExportUpgradeModalDismissed'

const useSetTaskEstimate = () => {
  const {submitMutation, submitting, error, onError, onCompleted} = useMutationProps({
    errorDisplay: 'inline'
  })
  const atmosphere = useAtmosphere()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeExportCount, setUpgradeExportCount] = useState(0)
  const [isHardBlock, setIsHardBlock] = useState(false)

  const dismissUpgradeModal = useCallback(() => {
    setShowUpgradeModal(false)
    setStorageItem('sessionStorage', JIRA_EXPORT_UPGRADE_MODAL_DISMISSED_KEY, 'true')
  }, [])

  const setTaskEstimate = (
    taskEstimate: TaskEstimateInput,
    stageId: string,
    onSuccess?: () => void
  ) => {
    const handleCompleted: CompletedHandler = (
      res: TSetTaskEstimateMutation['response'],
      errors
    ) => {
      onCompleted(res, errors)
      // Check for UPGRADE_REQUIRED error
      if (errors) {
        const upgradeError = errors.find((e) => e.extensions?.code === 'UPGRADE_REQUIRED')
        if (upgradeError) {
          setIsHardBlock(true)
          setShowUpgradeModal(true)
          return
        }
      }
      const {setTaskEstimate} = res
      const {error} = setTaskEstimate
      if (!error) {
        // Check if exportCount exceeds limit (soft prompt)
        const exportCount = setTaskEstimate.SetTaskEstimateMutation_meeting?.exportCount ?? 0
        if (
          exportCount > MAX_FREE_JIRA_EXPORTS &&
          !sessionStorage.getItem(JIRA_EXPORT_UPGRADE_MODAL_DISMISSED_KEY)
        ) {
          setUpgradeExportCount(exportCount)
          setIsHardBlock(false)
          setShowUpgradeModal(true)
        }
        onSuccess && onSuccess()
      }
    }

    const handleError = (error: Error) => {
      if (getMutationError(error).code === 'UPGRADE_REQUIRED') {
        onCompleted()
        setIsHardBlock(true)
        setShowUpgradeModal(true)
        return
      }
      onError(error)
    }

    submitMutation()

    SetTaskEstimateMutation(
      atmosphere,
      {taskEstimate},
      {onError: handleError, onCompleted: handleCompleted, stageId}
    )
  }

  return {
    setTaskEstimate,
    error,
    submitting,
    onError,
    onCompleted,
    showUpgradeModal,
    upgradeExportCount,
    isHardBlock,
    dismissUpgradeModal
  }
}

export default useSetTaskEstimate
