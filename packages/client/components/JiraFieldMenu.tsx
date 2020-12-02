import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import UpdateJiraDimensionFieldMutation from '../mutations/UpdateJiraDimensionFieldMutation'
import {SprintPokerDefaults} from '../types/constEnums'
import getJiraCloudIdAndKey from '../utils/getJiraCloudIdAndKey'
import {JiraFieldMenu_stage} from '../__generated__/JiraFieldMenu_stage.graphql'
import {JiraFieldMenu_viewer} from '../__generated__/JiraFieldMenu_viewer.graphql'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemHR from './MenuItemHR'
import MockJiraFieldList from './MockJiraFieldList'

interface Props {
  menuProps: MenuProps
  viewer: JiraFieldMenu_viewer | null
  error: Error | null
  stage: JiraFieldMenu_stage
}

const JiraFieldMenu = (props: Props) => {
  const {menuProps, viewer, stage} = props
  const {meetingId, dimensionId, serviceField, serviceTaskId} = stage
  const {name: serviceFieldName} = serviceField
  const isLoading = viewer === null
  const serverFields = viewer?.teamMember?.integrations.atlassian?.jiraFields ?? []
  const atmosphere = useAtmosphere()
  const {portalStatus, isDropdown, closePortal} = menuProps
  const [cloudId] = getJiraCloudIdAndKey(serviceTaskId)
  const handleClick = (fieldName: string) => () => {
    UpdateJiraDimensionFieldMutation(atmosphere, {dimensionId, fieldName, meetingId, cloudId})
    closePortal()
  }
  const defaultActiveidx = useMemo(() => {
    if (serverFields.length === 0) return undefined
    if (serviceFieldName === SprintPokerDefaults.JIRA_FIELD_COMMENT) return serverFields.length + 1
    if (serviceFieldName === SprintPokerDefaults.JIRA_FIELD_NULL) return serverFields.length + 2
    const idx = serverFields.indexOf(serviceFieldName)
    return idx === -1 ? undefined : idx
  }, [serviceFieldName, serverFields])

  if (isLoading) {
    return (
      <Menu ariaLabel={'Loading'} portalStatus={portalStatus} isDropdown={isDropdown}>
        <MockJiraFieldList />
      </Menu>
    )
  }

  return (
    <Menu
      ariaLabel={'Select the Jira Field to push to'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      defaultActiveIdx={defaultActiveidx}
    >
      {serverFields.map((fieldName) => {
        return (
          <MenuItem
            key={fieldName}
            label={fieldName}
            onClick={handleClick(fieldName)}
          />
        )
      })}
      <MenuItemHR />
      <MenuItem key={'__comment'} label={SprintPokerDefaults.JIRA_FIELD_COMMENT_LABEL} onClick={handleClick(SprintPokerDefaults.JIRA_FIELD_COMMENT)} />
      <MenuItem key={'__null'} label={SprintPokerDefaults.JIRA_FIELD_NULL_LABEL} onClick={handleClick(SprintPokerDefaults.JIRA_FIELD_NULL)} />
    </Menu>
  )
}


export default createFragmentContainer(JiraFieldMenu, {
  viewer: graphql`
    fragment JiraFieldMenu_viewer on User {
      teamMember(teamId: $teamId) {
        integrations {
          atlassian {
            jiraFields(cloudId: $cloudId)
          }
        }
      }
    }
  `,
  stage: graphql`
  fragment JiraFieldMenu_stage on EstimateStage {
    dimensionId
    meetingId
    serviceField {
      name
    }
    serviceTaskId
  }`
})
