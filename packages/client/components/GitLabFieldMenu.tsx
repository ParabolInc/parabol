import styled from '@emotion/styled'
import {Edit} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {GitLabFieldMenu_stage$key} from '../__generated__/GitLabFieldMenu_stage.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import useModal from '../hooks/useModal'
import UpdateGitLabDimensionFieldMutation from '../mutations/UpdateGitLabDimensionFieldMutation'
import textOverflow from '../styles/helpers/textOverflow'
import {PALETTE} from '../styles/paletteV3'
import {FONT_FAMILY} from '../styles/typographyV2'
import {SprintPokerDefaults} from '../types/constEnums'
import EditVotingLabelTemplateModal from './EditVotingLabelTemplateModal'
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
  stageRef: GitLabFieldMenu_stage$key
  submitScore(): void
}

const GitLabFieldMenu = (props: Props) => {
  const {menuProps, stageRef, submitScore} = props
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
  const {portalStatus, isDropdown, closePortal} = menuProps
  const {serviceField, task, dimensionRef, meetingId} = stage
  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  const defaults = [
    SprintPokerDefaults.GITLAB_FIELD_TIME_ESTIMATE,
    SprintPokerDefaults.GITLAB_FIELD_WEIGHT,
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL
  ] as string[]
  const defaultActiveIdx = defaults.indexOf(serviceFieldName)
  const {
    modalPortal,
    openPortal,
    closePortal: closeModal
  } = useModal({
    id: 'editGitLabLabel'
  })

  if (task?.integration?.__typename !== '_xGitLabIssue') return null
  const {integration} = task
  const {projectId} = integration
  if (!projectId) return null
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
        ariaLabel={'Select whether to publish estimate as a comment in GitLab'}
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
          label={SprintPokerDefaults.GITLAB_FIELD_TIME_ESTIMATE_LABEL}
          onClick={handleClick(SprintPokerDefaults.GITLAB_FIELD_TIME_ESTIMATE)}
        />
        <MenuItem
          label={SprintPokerDefaults.GITLAB_FIELD_WEIGHT_LABEL}
          onClick={handleClick(SprintPokerDefaults.GITLAB_FIELD_WEIGHT)}
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
        <EditVotingLabelTemplateModal
          updateLabelTemplate={handleClick}
          closePortal={closeModal}
          defaultValue={serviceFieldTemplate}
          placeholder={defaultLabelTemplate}
        />
      )}
    </>
  )
}

export default GitLabFieldMenu
