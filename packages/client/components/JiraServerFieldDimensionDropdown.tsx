import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {SprintPokerDefaults} from '../types/constEnums'
import {JiraServerFieldDimensionDropdown_stage$key} from '../__generated__/JiraServerFieldDimensionDropdown_stage.graphql'
import Icon from './Icon'
import JiraServerFieldMenu from './JiraServerFieldMenu'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  clearError: () => void
  isFacilitator: boolean
  stageRef: JiraServerFieldDimensionDropdown_stage$key
  submitScore(): void
}

const Wrapper = styled(PlainButton)<{isFacilitator: boolean}>(({isFacilitator}) => ({
  color: PALETTE.SLATE_700,
  cursor: isFacilitator ? undefined : 'default',
  display: 'flex',
  paddingRight: isFacilitator ? undefined : 8,
  userSelect: 'none',
  ':hover,:focus,:active': {
    opacity: isFacilitator ? '50%' : undefined
  }
}))

const CurrentValue = styled('div')({
  fontSize: 14
})

const StyledIcon = styled(Icon)<{isFacilitator: boolean}>(({isFacilitator}) => ({
  fontSize: ICON_SIZE.MD18,
  display: isFacilitator ? undefined : 'none'
}))

const labelLookup = {
  [SprintPokerDefaults.SERVICE_FIELD_COMMENT]: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
  [SprintPokerDefaults.SERVICE_FIELD_NULL]: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL
}

const JiraServerFieldDimensionDropdown = (props: Props) => {
  const {clearError, stageRef, isFacilitator, submitScore} = props

  const stage = useFragment(
    graphql`
      fragment JiraServerFieldDimensionDropdown_stage on EstimateStage {
        ...JiraServerFieldMenu_stage
        serviceField {
          name
        }
        task {
          integration {
            ... on JiraServerIssue {
              id
              possibleEstimationFieldNames
            }
          }
        }
      }
    `,
    stageRef
  )

  const {serviceField, task} = stage
  const possibleEstimationFieldNames = task?.integration?.possibleEstimationFieldNames ?? []
  const {name: serviceFieldName} = serviceField
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLButtonElement>(
    MenuPosition.UPPER_RIGHT,
    {
      isDropdown: true
    }
  )

  const onClick = () => {
    if (!isFacilitator) return
    togglePortal()
    clearError()
  }

  const lookupServiceFieldName = [
    ...possibleEstimationFieldNames,
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL
  ].includes(serviceFieldName)
    ? serviceFieldName
    : SprintPokerDefaults.SERVICE_FIELD_COMMENT

  const label = labelLookup[lookupServiceFieldName] ?? lookupServiceFieldName
  return (
    <Wrapper isFacilitator={isFacilitator} onClick={onClick} ref={originRef}>
      <CurrentValue>{label}</CurrentValue>
      <StyledIcon isFacilitator={isFacilitator}>{'expand_more'}</StyledIcon>
      {menuPortal(
        <JiraServerFieldMenu menuProps={menuProps} stage={stage} submitScore={submitScore} />
      )}
    </Wrapper>
  )
}

export default JiraServerFieldDimensionDropdown
