import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {ICON_SIZE} from '../styles/typographyV2'
import {SprintPokerDefaults} from '../types/constEnums'
import {AzureDevOpsFieldDimensionDropdown_stage$key} from '../__generated__/AzureDevOpsFieldDimensionDropdown_stage.graphql'
import AzureDevOpsFieldMenu from './AzureDevOpsFieldMenu'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  clearError: () => void
  isFacilitator: boolean
  stageRef: AzureDevOpsFieldDimensionDropdown_stage$key
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
  [SprintPokerDefaults.SERVICE_FIELD_NULL]: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL,
  [SprintPokerDefaults.AZUREDEVOPS_TASK_FIELD]: SprintPokerDefaults.AZUREDEVOPS_TAKS_FIELD_LABEL,
  [SprintPokerDefaults.AZUREDEVOPS_USERSTORY_FIELD]: SprintPokerDefaults.AZUREDEVOPS_USERSTORY_FIELD_LABEL
}

const AzureDevOpsFieldDimensionDropdown = (props: Props) => {
  const {clearError, isFacilitator, stageRef, submitScore} = props

  const stage = useFragment(
    graphql`
      fragment AzureDevOpsFieldDimensionDropdown_stage on EstimateStage {
        ...AzureDevOpsFieldMenu_stage
        serviceField {
          name
        }
        task {
          integration {
            ... on AzureDevOpsWorkItem {
              type
            }
          }
        }
      }
    `,
    stageRef
  )

  const {serviceField} = stage
  //const workItemType = task?.integration?.type
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

  // get this from the defaul field name for the type
  const lookupServiceFieldName = serviceFieldName
  const label =
    labelLookup[lookupServiceFieldName] || SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL
  return (
    <Wrapper isFacilitator={isFacilitator} onClick={onClick} ref={originRef}>
      <CurrentValue>{label}</CurrentValue>
      <StyledIcon isFacilitator={isFacilitator}>{'expand_more'}</StyledIcon>
      {menuPortal(
        <AzureDevOpsFieldMenu menuProps={menuProps} stageRef={stage} submitScore={submitScore} />
      )}
    </Wrapper>
  )
}

export default AzureDevOpsFieldDimensionDropdown
