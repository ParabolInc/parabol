import styled from '@emotion/styled-base'
import Edit from '@mui/icons-material/Edit'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import useModal from '../hooks/useModal'
import UpdateGitHubDimensionFieldMutation from '../mutations/UpdateGitHubDimensionFieldMutation'
import textOverflow from '../styles/helpers/textOverflow'
import {PALETTE} from '../styles/paletteV3'
import {FONT_FAMILY} from '../styles/typographyV2'
import {SprintPokerDefaults} from '../types/constEnums'
import {GitHubFieldMenu_stage$key} from '../__generated__/GitHubFieldMenu_stage.graphql'
import EditGitHubLabelTemplateModal from './EditGitHubLabelTemplateModal'
import FlatButton from './FlatButton'
import Menu from './Menu'
import MenuItem from './MenuItem'

const LabelOptionRoot = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  minWidth: '300px'
})

const LabelOptionBlock = styled('div')({
  display: 'block',
  flexDirection: 'column',
  maxWidth: '200px',
  paddingTop: 12,
  paddingLeft: 16,
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

const EditButtonGroup = styled('div')({
  paddingLeft: '8px',
  paddingRight: '8px',
  marginTop: 'auto',
  marginBottom: 'auto'
})
const Button = styled(FlatButton)({
  alignItems: 'center',
  color: PALETTE.SLATE_600,
  height: 32,
  justifyContent: 'center',
  padding: 0,
  width: 32
})

const ActionButton = styled(Edit)({
  height: 18,
  width: 18
})

interface Props {
  menuProps: MenuProps
  stageRef: GitHubFieldMenu_stage$key
  submitScore(): void
}

const GitHubFieldMenu = (props: Props) => {
  const {menuProps, stageRef, submitScore} = props
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
  const {portalStatus, isDropdown, closePortal} = menuProps
  const {serviceField, task, dimensionRef, meetingId} = stage
  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  const defaults = [
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL
  ] as string[]
  const defaultActiveIdx = defaults.indexOf(serviceFieldName) + 1
  const {
    modalPortal,
    openPortal,
    closePortal: closeModal
  } = useModal({
    id: 'editGitHubLabel',
    parentId: 'githubFieldMenu'
  })

  if (task?.integration?.__typename !== '_xGitHubIssue') return null
  const {integration} = task
  const {repository} = integration
  const {nameWithOwner} = repository
  const handleClick = (labelTemplate: string) => () => {
    if (labelTemplate !== serviceFieldName) {
      UpdateGitHubDimensionFieldMutation(
        atmosphere,
        {
          dimensionName,
          labelTemplate,
          nameWithOwner,
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
    closePortal()
  }
  const openEditModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    openPortal()
  }
  const defaultLabelTemplate = `${dimensionName}: {{#}}`
  const serviceFieldTemplate = defaults.includes(serviceFieldName)
    ? defaultLabelTemplate
    : serviceFieldName
  return (
    <>
      <Menu
        ariaLabel={'Select where to publish the estimate'}
        portalStatus={portalStatus}
        isDropdown={isDropdown}
        defaultActiveIdx={defaultActiveIdx}
      >
        <MenuItem
          label={
            <LabelOptionRoot>
              <LabelOptionBlock>
                <LabelOptionName>{'As a label'}</LabelOptionName>
                <LabelOptionSub>{serviceFieldTemplate}</LabelOptionSub>
              </LabelOptionBlock>
              <EditButtonGroup>
                <Button onClick={openEditModal} size='small'>
                  <ActionButton />
                </Button>
              </EditButtonGroup>
            </LabelOptionRoot>
          }
          onClick={handleClick(serviceFieldTemplate)}
        />
        <MenuItem
          label={SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL}
          onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_COMMENT)}
        />
        <MenuItem
          label={SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL}
          onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_NULL)}
        />
      </Menu>
      {modalPortal(
        <EditGitHubLabelTemplateModal
          updateLabelTemplate={handleClick}
          closePortal={closeModal}
          defaultValue={serviceFieldTemplate}
          placeholder={defaultLabelTemplate}
        />
      )}
    </>
  )
}

export default GitHubFieldMenu
