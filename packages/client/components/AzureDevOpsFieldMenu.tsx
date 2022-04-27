import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import UpdateAzureDevOpsDimensionFieldMutation from '../mutations/UpdateAzureDevOpsDimensionFieldMutation'
import {SprintPokerDefaults} from '../types/constEnums'
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
              title
              teamProject
              url
              state
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
  const defaultActiveIdx = useMemo(() => {
    if (
      serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL ||
      serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_COMMENT
    ) {
      return 1
    } else {
      return 0
    }
  }, [serviceFieldName])

  if (task?.integration?.__typename !== 'AzureDevOpsWorkItem') return null
  const {integration} = task
  const {teamProject, url, type: workItemType} = integration
  const getInstanceId = (url: URL) => {
    const index = url.pathname.indexOf('/', 1)
    return url.hostname + url.pathname.substring(0, index)
  }
  const handleClick = (fieldName: string) => () => {
    if (fieldName !== serviceFieldName) {
      UpdateAzureDevOpsDimensionFieldMutation(
        atmosphere,
        {
          meetingId,
          instanceId: getInstanceId(new URL(url)),
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
    if (workItemType === 'User Story') {
      return [
        {
          label: SprintPokerDefaults.AZUREDEVOPS_USERSTORY_FIELD_LABEL,
          fieldValue: SprintPokerDefaults.AZUREDEVOPS_USERSTORY_FIELD
        },
        {
          label: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
          fieldValue: SprintPokerDefaults.SERVICE_FIELD_COMMENT
        }
      ]
    } else if (workItemType === 'Task') {
      return [
        {
          label: SprintPokerDefaults.AZUREDEVOPS_TAKS_FIELD_LABEL,
          fieldValue: SprintPokerDefaults.AZUREDEVOPS_TASK_FIELD
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
