import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import UpdateJiraDimensionFieldMutation from '../mutations/UpdateJiraDimensionFieldMutation'
import {SprintPokerDefaults} from '../types/constEnums'
import {JiraFieldMenu_stage} from '../__generated__/JiraFieldMenu_stage.graphql'
import {JiraFieldMenu_viewer} from '../__generated__/JiraFieldMenu_viewer.graphql'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemHR from './MenuItemHR'
import MockFieldList from './MockFieldList'

interface Props {
  menuProps: MenuProps
  viewer: JiraFieldMenu_viewer | null
  error: Error | null
  stage: JiraFieldMenu_stage
}

const JiraFieldMenu = (props: Props) => {
  const {menuProps, viewer, stage} = props
  const atmosphere = useAtmosphere()
  const {portalStatus, isDropdown, closePortal} = menuProps
  const {meetingId, dimensionRef, serviceField, task} = stage
  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  const isLoading = viewer === null
  const serverFields = viewer?.teamMember?.integrations.atlassian?.jiraFields ?? []
  const defaultActiveidx = useMemo(() => {
    if (serverFields.length === 0) return undefined
    if (serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_COMMENT)
      return serverFields.length + 1
    if (serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_NULL) return serverFields.length + 2
    const idx = serverFields.indexOf(serviceFieldName)
    return idx === -1 ? undefined : idx
  }, [serviceFieldName, serverFields])

  if (task?.integration?.__typename !== 'JiraIssue') return null
  const {integration} = task
  const {cloudId, projectKey} = integration

  if (serverFields.length === 0) {
    const child = isLoading ? (
      <MockFieldList />
    ) : (
      <MenuItem key={'noResults'} label={'<<Cannot connect to Jira>>'} />
    )
    return (
      <Menu ariaLabel={'Loading'} portalStatus={portalStatus} isDropdown={isDropdown}>
        {child}
      </Menu>
    )
  }

  const handleClick = (fieldName: string) => () => {
    UpdateJiraDimensionFieldMutation(atmosphere, {
      dimensionName,
      fieldName,
      meetingId,
      cloudId,
      projectKey
    })
    closePortal()
  }
  return (
    <Menu
      ariaLabel={'Select the Jira Field to push to'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      defaultActiveIdx={defaultActiveidx}
    >
      {serverFields.map((fieldName) => {
        return <MenuItem key={fieldName} label={fieldName} onClick={handleClick(fieldName)} />
      })}
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
      dimensionRef {
        name
      }
      meetingId
      serviceField {
        name
      }
      task {
        integration {
          ... on JiraIssue {
            __typename
            projectKey
            cloudId
          }
        }
      }
    }
  `
})
