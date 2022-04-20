import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import {SprintPokerDefaults} from '../types/constEnums'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemHR from './MenuItemHR'

interface Props {
  menuProps: MenuProps
  stage: AzureDevOpsFieldMenu_stage
  submitScore(): void
}

const AzureDevOpsFieldMenu = (props: Props) => {
  const {menuProps, stage, submitScore} = props
  const atmosphere = useAtmosphere()
  const {portalStatus, isDropdown, closePortal} = menuProps
  const {meetingId, dimensionRef, serviceField, task} = stage
  if (task?.integration?.__typename !== 'AzureDevOpsWorkItem') return null
  const {integration} = task
  const {id: workItemId, title, teamProject, url, state, type} = integration
  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField

  const handleClick = (fieldName: string) => () => {
    // todo: push results back to AzureDevOps
    closePortal()
  }
  return (
    <Menu
      ariaLabel={'Select the Jira Field to push to'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      defaultActiveIdx={1}
    >
      <MenuItemHR />
      <MenuItem
        key={'__comment'}
        label={SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL}
        onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_COMMENT)}
      />
      <MenuItem
        key={'__null'}
        label={SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL}
        onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_NULL)}
      />
    </Menu>
  )
}

export default createFragmentContainer(AzureDevOpsFieldMenu, {
  stage: graphql`
    fragment AzureDevOpsFieldMenu_stage on EstimateStage {
      dimensionRef {
        name
      }
      meetingId
      serviceField {
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
    }
  `
})
