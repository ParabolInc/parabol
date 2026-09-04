import graphql from 'babel-plugin-relay/macro'
import {type MouseEvent} from 'react'
import {useFragment} from 'react-relay'
import {Edit} from '~/ui/icons'
import type {GitHubFieldMenu_stage$key} from '../__generated__/GitHubFieldMenu_stage.graphql'
import useUpdateIntegrationDimensionFieldMutation from '../mutations/useUpdateIntegrationDimensionFieldMutation'
import {SprintPokerDefaults} from '../types/constEnums'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'

export type EditModalConfig = {
  updateLabelTemplate: (labelTemplate: string) => () => void
  defaultValue: string
  placeholder: string
}

interface Props {
  onOpenEditModal: (config: EditModalConfig) => void
  stageRef: GitHubFieldMenu_stage$key
  submitScore(): void
}

const GitHubFieldMenu = (props: Props) => {
  const {onOpenEditModal, stageRef, submitScore} = props
  const [updateIntegrationDimensionField] = useUpdateIntegrationDimensionFieldMutation()
  const stage = useFragment(
    graphql`
      fragment GitHubFieldMenu_stage on EstimateStage {
        serviceField {
          name
        }
        dimensionRef {
          name
        }
        task {
          id
          integration {
            ... on _xGitHubIssue {
              __typename
            }
          }
        }
        meetingId
      }
    `,
    stageRef
  )
  const {serviceField, task, dimensionRef, meetingId} = stage
  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  const defaults = [
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL
  ] as string[]

  if (task?.integration?.__typename !== '_xGitHubIssue') return null
  const {id: taskId} = task

  const defaultLabelTemplate = `${dimensionName}: {{#}}`
  const serviceFieldTemplate = defaults.includes(serviceFieldName)
    ? defaultLabelTemplate
    : serviceFieldName

  const handleClick = (labelTemplate: string) => () => {
    if (labelTemplate !== serviceFieldName) {
      updateIntegrationDimensionField(
        {variables: {meetingId, taskId, dimensionName, fieldId: labelTemplate}},
        {onSuccess: submitScore}
      )
    } else {
      submitScore()
    }
  }

  const openEditModal = (e: MouseEvent) => {
    e.stopPropagation()
    onOpenEditModal({
      updateLabelTemplate: handleClick,
      defaultValue: serviceFieldTemplate,
      placeholder: defaultLabelTemplate
    })
  }

  return (
    <MenuContent>
      <MenuItem onClick={handleClick(serviceFieldTemplate)}>
        <div className='flex min-w-[300px] items-center justify-between'>
          <div className='block max-w-[200px] grow'>
            <div className='flex font-sans text-fg-primary leading-6'>{'As a label'}</div>
            <div className='truncate font-sans text-[11px] text-fg-secondary leading-4'>
              {serviceFieldTemplate}
            </div>
          </div>
          <button
            className='mr-2 flex h-8 w-8 items-center justify-center rounded text-fg-secondary hover:bg-surface-hover'
            onClick={openEditModal}
          >
            <Edit style={{height: 18, width: 18}} />
          </button>
        </div>
      </MenuItem>
      <MenuItem onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_COMMENT)}>
        {SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL}
      </MenuItem>
      <MenuItem onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_NULL)}>
        {SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL}
      </MenuItem>
    </MenuContent>
  )
}

export default GitHubFieldMenu
