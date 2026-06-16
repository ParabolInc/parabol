import styled from '@emotion/styled'
import {Edit} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {type MouseEvent} from 'react'
import {useFragment} from 'react-relay'
import type {GitLabFieldMenu_stage$key} from '../__generated__/GitLabFieldMenu_stage.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import UpdateGitLabDimensionFieldMutation from '../mutations/UpdateGitLabDimensionFieldMutation'
import textOverflow from '../styles/helpers/textOverflow'
import {PALETTE} from '../styles/paletteV3'
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
  color: PALETTE.SLATE_700,
  display: 'flex',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  lineHeight: '24px'
})

const LabelOptionSub = styled('div')({
  ...textOverflow,
  color: PALETTE.SLATE_600,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 12,
  lineHeight: '16px'
})

interface Props {
  onOpenEditModal: (config: EditModalConfig) => void
  stageRef: GitLabFieldMenu_stage$key
  submitScore(): void
}

const GitLabFieldMenu = (props: Props) => {
  const {onOpenEditModal, stageRef, submitScore} = props
  const atmosphere = useAtmosphere()
  const stage = useFragment(
    graphql`
      fragment GitLabFieldMenu_stage on EstimateStage {
        serviceField {
          name
        }
        dimensionRef {
          name
        }
        task {
          integration {
            ... on _xGitLabIssue {
              __typename
              id
              projectId
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
    SprintPokerDefaults.GITLAB_FIELD_TIME_ESTIMATE,
    SprintPokerDefaults.GITLAB_FIELD_WEIGHT,
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL
  ] as string[]

  if (task?.integration?.__typename !== '_xGitLabIssue') return null
  const {integration} = task
  const {projectId} = integration
  if (!projectId) return null

  const defaultLabelTemplate = `${dimensionName}: {{#}}`
  const serviceFieldTemplate = defaults.includes(serviceFieldName)
    ? defaultLabelTemplate
    : serviceFieldName

  const handleClick = (labelTemplate: string) => () => {
    if (labelTemplate !== serviceFieldName) {
      UpdateGitLabDimensionFieldMutation(
        atmosphere,
        {
          dimensionName,
          labelTemplate,
          projectId,
          meetingId
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
            className='mr-2 flex h-8 w-8 items-center justify-center rounded text-slate-600 hover:bg-slate-100'
            onClick={openEditModal}
          >
            <Edit style={{height: 18, width: 18}} />
          </button>
        </div>
      </MenuItem>
      <MenuItem onClick={handleClick(SprintPokerDefaults.GITLAB_FIELD_TIME_ESTIMATE)}>
        {SprintPokerDefaults.GITLAB_FIELD_TIME_ESTIMATE_LABEL}
      </MenuItem>
      <MenuItem onClick={handleClick(SprintPokerDefaults.GITLAB_FIELD_WEIGHT)}>
        {SprintPokerDefaults.GITLAB_FIELD_WEIGHT_LABEL}
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

export default GitLabFieldMenu
