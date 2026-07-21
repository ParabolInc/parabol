import styled from '@emotion/styled'
import {Edit} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {type MouseEvent} from 'react'
import {useFragment} from 'react-relay'
import type {GitHubFieldMenu_stage$key} from '../__generated__/GitHubFieldMenu_stage.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import UpdateGitHubDimensionFieldMutation from '../mutations/UpdateGitHubDimensionFieldMutation'
import textOverflow from '../styles/helpers/textOverflow'
import {FONT_FAMILY} from '../styles/typographyV2'
import {SprintPokerDefaults} from '../types/constEnums'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'

export type EditModalConfig = {
  updateLabelTemplate: (labelTemplate: string) => () => void
  defaultValue: string
  placeholder: string
}

const LabelOptionBlock = styled('div')({
  display: 'block',
  flexDirection: 'column',
  maxWidth: '200px',
  paddingTop: 12,
  paddingBottom: 12,
  flexGrow: 1
})

const LabelOptionName = styled('div')({
  color: 'var(--color-fg-primary)',
  display: 'flex',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  lineHeight: '24px'
})

const LabelOptionSub = styled('div')({
  ...textOverflow,
  color: 'var(--color-fg-secondary)',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 11,
  lineHeight: '16px'
})

interface Props {
  onOpenEditModal: (config: EditModalConfig) => void
  stageRef: GitHubFieldMenu_stage$key
  submitScore(): void
}

const GitHubFieldMenu = (props: Props) => {
  const {onOpenEditModal, stageRef, submitScore} = props
  const atmosphere = useAtmosphere()
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
  const {serviceField, task, dimensionRef, meetingId} = stage
  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  const defaults = [
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL
  ] as string[]

  if (task?.integration?.__typename !== '_xGitHubIssue') return null
  const {integration} = task
  const {repository} = integration
  const {nameWithOwner} = repository

  const defaultLabelTemplate = `${dimensionName}: {{#}}`
  const serviceFieldTemplate = defaults.includes(serviceFieldName)
    ? defaultLabelTemplate
    : serviceFieldName

  const handleClick = (labelTemplate: string) => () => {
    if (labelTemplate !== serviceFieldName) {
      UpdateGitHubDimensionFieldMutation(
        atmosphere,
        {dimensionName, labelTemplate, nameWithOwner, meetingId},
        {
          onCompleted: submitScore,
          onError: () => {}
        }
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
          <LabelOptionBlock>
            <LabelOptionName>{'As a label'}</LabelOptionName>
            <LabelOptionSub>{serviceFieldTemplate}</LabelOptionSub>
          </LabelOptionBlock>
          <button
            className='mr-2 flex h-8 w-8 items-center justify-center rounded text-fg-secondary hover:bg-surface-raised'
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
