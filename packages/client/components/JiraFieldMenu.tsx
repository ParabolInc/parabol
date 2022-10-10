import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import UpdateJiraDimensionFieldMutation from '../mutations/UpdateJiraDimensionFieldMutation'
import {SprintPokerDefaults} from '../types/constEnums'
import {JiraFieldMenu_stage} from '../__generated__/JiraFieldMenu_stage.graphql'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemHR from './MenuItemHR'
import MenuItemLabel from './MenuItemLabel'

interface Props {
  menuProps: MenuProps
  stage: JiraFieldMenu_stage
  submitScore(): void
}

const HintLabel = styled(MenuItemLabel)({
  fontStyle: 'italic'
})

const JiraFieldMenu = (props: Props) => {
  const {menuProps, stage, submitScore} = props
  const atmosphere = useAtmosphere()
  const {portalStatus, isDropdown, closePortal} = menuProps
  const {meetingId, dimensionRef, serviceField, task} = stage
  if (task?.integration?.__typename !== 'JiraIssue') return null
  const {integration} = task
  const {cloudId, projectKey, issueType, possibleEstimationFieldNames, missingEstimationFieldHint} =
    integration
  console.log('GEORG missingEstimationFieldHint', missingEstimationFieldHint)

  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  /* eslint-disable react-hooks/rules-of-hooks */
  const defaultActiveidx = useMemo(() => {
    if (possibleEstimationFieldNames.length === 0) return undefined
    if (serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_COMMENT)
      return possibleEstimationFieldNames.length + 1
    if (serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_NULL)
      return possibleEstimationFieldNames.length + 2
    const idx = possibleEstimationFieldNames.indexOf(serviceFieldName)
    return idx === -1 ? undefined : idx
  }, [serviceFieldName, possibleEstimationFieldNames])

  const handleClickMissingField = () => {
    if (missingEstimationFieldHint === 'companyManagedStoryPoints') {
      // goto company
    } else if (missingEstimationFieldHint === 'teamManagedStoryPoints') {
      // goto team
    }
  }

  const handleClick = (fieldName: string) => () => {
    UpdateJiraDimensionFieldMutation(
      atmosphere,
      {
        dimensionName,
        fieldName,
        meetingId,
        cloudId,
        projectKey,
        issueType
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
      {possibleEstimationFieldNames.map((fieldName) => {
        return <MenuItem key={fieldName} label={fieldName} onClick={handleClick(fieldName)} />
      })}
      {possibleEstimationFieldNames.length > 0 && <MenuItemHR />}
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
          onClick={handleClickMissingField}
          label={<HintLabel>Where is my field?</HintLabel>}
        />
      )}
    </Menu>
  )
}

export default createFragmentContainer(JiraFieldMenu, {
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
            issueType
            possibleEstimationFieldNames
            missingEstimationFieldHint
          }
        }
      }
    }
  `
})
