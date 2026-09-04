import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import type {AzureDevOpsFieldMenu_stage$key} from '../__generated__/AzureDevOpsFieldMenu_stage.graphql'
import useUpdateIntegrationDimensionFieldMutation from '../mutations/useUpdateIntegrationDimensionFieldMutation'
import {SprintPokerDefaults} from '../types/constEnums'
import {Select} from '../ui/Select/Select'
import {SelectContent} from '../ui/Select/SelectContent'
import {SelectItem} from '../ui/Select/SelectItem'
import {SelectSeparator} from '../ui/Select/SelectSeparator'
import {SelectTrigger} from '../ui/Select/SelectTrigger'
import {
  azureDevOpsEffortWorkItems,
  azureDevOpsOriginalEstimateWorkItems,
  azureDevOpsRemainingWorkWorkItems,
  azureDevOpsStoryPointWorkItems
} from '../utils/AzureDevOpsWorkItemFields'

import {
  fromSelectValue,
  SERVICE_FIELD_NULL_VALUE,
  toSelectValue
} from '../utils/serviceFieldSelectValue'

interface Props {
  stageRef: AzureDevOpsFieldMenu_stage$key
  trigger: ReactNode
  onOpenChange: (isOpen: boolean) => void
  submitScore(): void
}

interface MenuOption {
  label: string
  fieldValue: string
}

const AzureDevOpsFieldMenu = (props: Props) => {
  const {stageRef, trigger, onOpenChange, submitScore} = props
  const [updateIntegrationDimensionField] = useUpdateIntegrationDimensionFieldMutation()
  const stage = useFragment(
    graphql`
      fragment AzureDevOpsFieldMenu_stage on EstimateStage {
        serviceField {
          name
        }
        dimensionRef {
          name
        }
        task {
          id
          integration {
            ... on AzureDevOpsWorkItem {
              __typename
              id
              type
            }
          }
        }
        meetingId
      }
    `,
    stageRef
  )
  const {serviceField, task, meetingId, dimensionRef} = stage
  const {name: serviceFieldName} = serviceField
  const {name: dimensionName} = dimensionRef
  if (task?.integration?.__typename !== 'AzureDevOpsWorkItem') return null
  const {id: taskId, integration} = task
  const {type: workItemType} = integration

  const handleValueChange = (value: string) => {
    const fieldName = fromSelectValue(value)
    if (fieldName !== serviceFieldName) {
      updateIntegrationDimensionField(
        {variables: {meetingId, taskId, dimensionName, fieldId: fieldName}},
        {onSuccess: submitScore}
      )
    } else {
      submitScore()
    }
  }

  const getDefaultMenuValues = (workItemType: string): MenuOption[] => {
    if (azureDevOpsStoryPointWorkItems.includes(workItemType)) {
      return [
        {
          label: SprintPokerDefaults.AZURE_DEVOPS_USERSTORY_FIELD_LABEL,
          fieldValue: SprintPokerDefaults.AZURE_DEVOPS_USERSTORY_FIELD
        },
        {
          label: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
          fieldValue: SprintPokerDefaults.SERVICE_FIELD_COMMENT
        }
      ]
    } else if (azureDevOpsOriginalEstimateWorkItems.includes(workItemType)) {
      return [
        {
          label: SprintPokerDefaults.AZURE_DEVOPS_TASK_FIELD_LABEL,
          fieldValue: SprintPokerDefaults.AZURE_DEVOPS_TASK_FIELD
        },
        {
          label: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
          fieldValue: SprintPokerDefaults.SERVICE_FIELD_COMMENT
        }
      ]
    } else if (azureDevOpsRemainingWorkWorkItems.includes(workItemType)) {
      return [
        {
          label: SprintPokerDefaults.AZURE_DEVOPS_REMAINING_WORK_LABEL,
          fieldValue: SprintPokerDefaults.AZURE_DEVOPS_REMAINING_WORK_FIELD
        },
        {
          label: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
          fieldValue: SprintPokerDefaults.SERVICE_FIELD_COMMENT
        }
      ]
    } else if (azureDevOpsEffortWorkItems.includes(workItemType)) {
      return [
        {
          label: SprintPokerDefaults.AZURE_DEVOPS_EFFORT_LABEL,
          fieldValue: SprintPokerDefaults.AZURE_DEVOPS_EFFORT_FIELD
        },
        {
          label: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
          fieldValue: SprintPokerDefaults.SERVICE_FIELD_COMMENT
        }
      ]
    } else {
      return [
        {
          label: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
          fieldValue: SprintPokerDefaults.SERVICE_FIELD_COMMENT
        }
      ]
    }
  }

  const menuValues = getDefaultMenuValues(workItemType)

  // the stage may store either the field's value or its label
  const selectedByLabel = menuValues.find(({label}) => label === serviceFieldName)
  const selectedValue = selectedByLabel
    ? selectedByLabel.fieldValue
    : toSelectValue(serviceFieldName)

  return (
    <Select value={selectedValue} onValueChange={handleValueChange} onOpenChange={onOpenChange}>
      <SelectTrigger asChild>{trigger}</SelectTrigger>
      <SelectContent>
        {menuValues.map(({label, fieldValue}) => {
          return (
            <SelectItem key={fieldValue} value={fieldValue}>
              {label}
            </SelectItem>
          )
        })}
        <SelectSeparator />
        <SelectItem value={SERVICE_FIELD_NULL_VALUE}>
          {SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

export default AzureDevOpsFieldMenu
