import styled from '@emotion/styled'
import {OpenInNew} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import UpdateJiraDimensionFieldMutation from '../mutations/UpdateJiraDimensionFieldMutation'
import {PALETTE} from '../styles/paletteV3'
import {ExternalLinks, SprintPokerDefaults} from '../types/constEnums'
import {JiraFieldMenu_stage$key} from '../__generated__/JiraFieldMenu_stage.graphql'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemHR from './MenuItemHR'
import MenuItemLabel from './MenuItemLabel'

interface Props {
  menuProps: MenuProps
  stage: JiraFieldMenu_stage$key
  submitScore(): void
}

const HintLabel = styled(MenuItemLabel)({
  fontStyle: 'italic'
})

const ExternalIcon = styled(OpenInNew)({
  marginLeft: 'auto',
  color: PALETTE.SLATE_500,
  paddingLeft: 12,
  width: 30,
  height: 18
})

const JiraFieldMenu = (props: Props) => {
  const {menuProps, stage: stageRef, submitScore} = props
  const stage = useFragment(
    graphql`
      fragment JiraFieldMenu_stage on EstimateStage {
        dimensionRef {
          name
        }
        meetingId
        serviceField {
          name
        }
        task {
          id
          teamId
          integration {
            ... on JiraIssue {
              __typename
              possibleEstimationFields {
                fieldId
                fieldName
              }
              missingEstimationFieldHint
            }
          }
        }
      }
    `,
    stageRef
  )
  const atmosphere = useAtmosphere()
  const {portalStatus, isDropdown, closePortal} = menuProps
  const {meetingId, dimensionRef, serviceField, task} = stage
  if (task?.integration?.__typename !== 'JiraIssue') return null
  const {id: taskId, teamId, integration} = task
  const {possibleEstimationFields, missingEstimationFieldHint} = integration

  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  /* eslint-disable react-hooks/rules-of-hooks */
  const defaultActiveidx = useMemo(() => {
    if (possibleEstimationFields.length === 0) return undefined
    if (serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_COMMENT)
      return possibleEstimationFields.length + 1
    if (serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_NULL)
      return possibleEstimationFields.length + 2
    const idx = possibleEstimationFields.findIndex(({fieldName}) => fieldName === serviceFieldName)
    return idx === -1 ? undefined : idx
  }, [serviceFieldName, possibleEstimationFields])

  const handleClickMissingField = () => {
    if (!missingEstimationFieldHint) {
      return
    }

    if (missingEstimationFieldHint === 'companyManagedStoryPoints') {
      window.open(
        ExternalLinks.INTEGRATIONS_SUPPORT_JIRA_MISSING_FIELD_COMPANY_MANAGED,
        '_blank',
        'noreferrer'
      )
    } else if (missingEstimationFieldHint === 'teamManagedStoryPoints') {
      window.open(
        ExternalLinks.INTEGRATIONS_SUPPORT_JIRA_MISSING_FIELD_TEAM_MANAGED,
        '_blank',
        'noreferrer'
      )
    }
    SendClientSegmentEventMutation(atmosphere, 'Jira Missing Field Doc Link Clicked', {
      meetingId,
      teamId,
      taskId,
      jiraProjectType:
        missingEstimationFieldHint === 'companyManagedStoryPoints' ? 'COMPANY' : 'TEAM'
    })
  }

  const handleClick = (fieldId: string) => () => {
    UpdateJiraDimensionFieldMutation(
      atmosphere,
      {
        taskId,
        dimensionName,
        fieldId,
        meetingId
      },
      {
        onCompleted: submitScore,
        onError: () => {
          /* noop */
        }
      }
    )
    closePortal()
  }
  return (
    <Menu
      ariaLabel={'Select the Jira Field to push to'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      defaultActiveIdx={defaultActiveidx}
    >
      {possibleEstimationFields.map(({fieldId, fieldName}) => {
        return <MenuItem key={fieldId} label={fieldName} onClick={handleClick(fieldId)} />
      })}
      {possibleEstimationFields.length > 0 && <MenuItemHR />}
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
      {missingEstimationFieldHint && (
        <MenuItem
          label={
            <HintLabel>
              Where's my field?
              <ExternalIcon />
            </HintLabel>
          }
          onClick={handleClickMissingField}
          noCloseOnClick
        />
      )}
    </Menu>
  )
}

export default JiraFieldMenu
