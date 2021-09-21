import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import UpdateGitHubDimensionFieldMutation from '../mutations/UpdateGitHubDimensionFieldMutation'
import interpolateGitHubLabelTemplate from '../shared/interpolateGitHubLabelTemplate'
import {SprintPokerDefaults} from '../types/constEnums'
import {GitHubFieldMenu_stage$key} from '../__generated__/GitHubFieldMenu_stage.graphql'
import Menu from './Menu'
import MenuItem from './MenuItem'
interface Props {
  menuProps: MenuProps
  stageRef: GitHubFieldMenu_stage$key
}

const GitHubFieldMenu = (props: Props) => {
  const {menuProps, stageRef} = props
  const atmosphere = useAtmosphere()
  const stage = useFragment(
    graphql`
      fragment GitHubFieldMenu_stage on EstimateStage {
        finalScore
        serviceField {
          name
        }
        dimensionRef {
          name
        }
        task {
          integration {
            ... on _xGitHubIssue {
              __typename
              repository {
                nameWithOwner
              }
            }
          }
        }
        meetingId
      }
    `,
    stageRef
  )
  const {portalStatus, isDropdown, closePortal} = menuProps
  const {finalScore, serviceField, task, dimensionRef, meetingId} = stage
  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  const defaults = [
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL
  ] as string[]
  const defaultActiveIdx = defaults.indexOf(serviceFieldName) + 1

  if (task?.integration?.__typename !== '_xGitHubIssue') return null
  const {integration} = task
  const {repository} = integration
  const {nameWithOwner} = repository
  const handleClick = (labelTemplate: string) => () => {
    UpdateGitHubDimensionFieldMutation(atmosphere, {
      dimensionName,
      labelTemplate,
      nameWithOwner,
      meetingId
    })
    closePortal()
  }
  const serviceFieldTemplate = defaults.includes(serviceFieldName)
    ? `${dimensionName}: {{#}}`
    : serviceFieldName
  const serviceFieldLabel = interpolateGitHubLabelTemplate(serviceFieldTemplate, finalScore)

  return (
    <Menu
      ariaLabel={'Select where to publish the estimate'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      defaultActiveIdx={defaultActiveIdx}
    >
      <MenuItem label={serviceFieldLabel} onClick={handleClick(serviceFieldTemplate)} />
      <MenuItem
        label={SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL}
        onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_COMMENT)}
      />
      <MenuItem
        label={SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL}
        onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_NULL)}
      />
    </Menu>
  )
}

export default GitHubFieldMenu
