import {ExpandMore} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {AzureDevOpsFieldDimensionDropdown_stage$key} from '../__generated__/AzureDevOpsFieldDimensionDropdown_stage.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {SprintPokerDefaults} from '../types/constEnums'
import {
  azureDevOpsEffortWorkItems,
  azureDevOpsOriginalEstimateWorkItems,
  azureDevOpsRemainingWorkWorkItems,
  azureDevOpsStoryPointWorkItems
} from '../utils/AzureDevOpsWorkItemFields'
import AzureDevOpsFieldMenu from './AzureDevOpsFieldMenu'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  clearError: () => void
  isFacilitator: boolean
  stageRef: AzureDevOpsFieldDimensionDropdown_stage$key
  submitScore(): void
}

const AzureDevOpsFieldDimensionDropdown = (props: Props) => {
  const {clearError, isFacilitator, stageRef, submitScore} = props

  const stage = useFragment(
    graphql`
      fragment AzureDevOpsFieldDimensionDropdown_stage on EstimateStage {
        ...AzureDevOpsFieldMenu_stage
        serviceField {
          name
        }
        task {
          integration {
            ... on AzureDevOpsWorkItem {
              type
            }
          }
        }
      }
    `,
    stageRef
  )

  const {serviceField, task} = stage
  const {name: serviceFieldName} = serviceField
  const workItemType = task?.integration?.type

  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLButtonElement>(
    MenuPosition.UPPER_RIGHT,
    {
      isDropdown: true
    }
  )

  const onClick = () => {
    if (!isFacilitator) return
    togglePortal()
    clearError()
  }

  const getLabelValue = (workItemType: string | undefined) => {
    if (serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_NULL) {
      return SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL
    }
    if (!workItemType) {
      return SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL
    }
    if (azureDevOpsEffortWorkItems.includes(workItemType)) {
      return serviceFieldName === SprintPokerDefaults.AZURE_DEVOPS_EFFORT_FIELD
        ? SprintPokerDefaults.AZURE_DEVOPS_EFFORT_LABEL
        : SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL
    } else if (azureDevOpsRemainingWorkWorkItems.includes(workItemType)) {
      return serviceFieldName === SprintPokerDefaults.AZURE_DEVOPS_REMAINING_WORK_FIELD
        ? SprintPokerDefaults.AZURE_DEVOPS_REMAINING_WORK_LABEL
        : SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL
    } else if (azureDevOpsOriginalEstimateWorkItems.includes(workItemType)) {
      return serviceFieldName === SprintPokerDefaults.AZURE_DEVOPS_TASK_FIELD
        ? SprintPokerDefaults.AZURE_DEVOPS_TASK_FIELD_LABEL
        : SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL
    } else if (azureDevOpsStoryPointWorkItems.includes(workItemType)) {
      return serviceFieldName === SprintPokerDefaults.AZURE_DEVOPS_USERSTORY_FIELD
        ? SprintPokerDefaults.AZURE_DEVOPS_USERSTORY_FIELD_LABEL
        : SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL
    } else {
      return SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL
    }
  }

  const label = getLabelValue(workItemType)

  return (
    <PlainButton
      className={`flex select-none text-fg-primary ${isFacilitator ? 'hover:opacity-50 focus:opacity-50 active:opacity-50' : 'cursor-default pr-2'}`}
      onClick={onClick}
      ref={originRef}
    >
      <div className='text-sm'>{label}</div>
      <ExpandMore className={`h-[18px] w-[18px] ${!isFacilitator ? 'hidden' : ''}`} />
      {menuPortal(
        <AzureDevOpsFieldMenu menuProps={menuProps} stageRef={stage} submitScore={submitScore} />
      )}
    </PlainButton>
  )
}

export default AzureDevOpsFieldDimensionDropdown
