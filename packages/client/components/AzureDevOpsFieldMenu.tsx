import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import UpdateAzureDevOpsDimensionFieldMutation from '../mutations/UpdateAzureDevOpsDimensionFieldMutation'
import {SprintPokerDefaults} from '../types/constEnums'
import AzureDevOpsClientManager from '../utils/AzureDevOpsClientManager'
import {
  azureDevOpsEffortWorkItems,
  azureDevOpsOriginalEstimateWorkItems,
  azureDevOpsRemainingWorkWorkItems,
  azureDevOpsStoryPointWorkItems
} from '../utils/AzureDevOpsWorkItemFields'
import {AzureDevOpsFieldMenu_stage$key} from '../__generated__/AzureDevOpsFieldMenu_stage.graphql'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemHR from './MenuItemHR'

interface Props {
  menuProps: MenuProps
  stageRef: AzureDevOpsFieldMenu_stage$key
  submitScore(): void
}

interface MenuOption {
  label: string
  fieldValue: string
}

const AzureDevOpsFieldMenu = (props: Props) => {
  const {menuProps, stageRef, submitScore} = props
  const atmosphere = useAtmosphere()
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
          integration {
            ... on AzureDevOpsWorkItem {
              __typename

              id
              teamProject
              url
              type
            }
          }
        }
        meetingId
      }
    `,
    stageRef
  )
  const {portalStatus, isDropdown, closePortal} = menuProps
  const {serviceField, task, meetingId, dimensionRef} = stage
  const {name: serviceFieldName} = serviceField
  const {name: dimensionName} = dimensionRef
  if (task?.integration?.__typename !== 'AzureDevOpsWorkItem') return null
  const {integration} = task
  const {teamProject, url, type: workItemType} = integration

  const handleClick = (fieldName: string) => () => {
    if (fieldName !== serviceFieldName) {
      UpdateAzureDevOpsDimensionFieldMutation(
        atmosphere,
        {
          meetingId,
          instanceId: AzureDevOpsClientManager.getInstanceId(new URL(url)),
          dimensionName,
          fieldName,
          projectKey: teamProject
        },
        {
          onCompleted: submitScore,
          onError: () => {
            /* noop */
          }
        }
      )
    } else {
      submitScore()
    }
    closePortal()
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

  const getDefaultIdx = () => {
    let returnedIndex = 0
    menuValues.forEach((menuOption, index) => {
      const {label, fieldValue} = menuOption
      if (serviceFieldName === label || serviceFieldName === fieldValue) {
        returnedIndex = index
      }
    })
    if (
      serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL ||
      serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_NULL
    ) {
      returnedIndex = menuValues.length + 1
    }
    return returnedIndex
  }
  const defaultActiveIdx = getDefaultIdx()

  return (
    <>
      <Menu
        ariaLabel={'Select where to publish the estimate'}
        portalStatus={portalStatus}
        isDropdown={isDropdown}
        defaultActiveIdx={defaultActiveIdx}
      >
        {menuValues.map(({label, fieldValue}) => {
          return <MenuItem key={fieldValue} label={label} onClick={handleClick(fieldValue)} />
        })}
        <MenuItemHR />
        <MenuItem
          label={SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL}
          onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_NULL)}
        />
      </Menu>
    </>
  )
}

export default AzureDevOpsFieldMenu
