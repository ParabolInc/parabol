import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {ICON_SIZE} from '../styles/typographyV2'
import {SprintPokerDefaults} from '../types/constEnums'
import {GitLabFieldDimensionDropdown_stage$key} from '../__generated__/GitLabFieldDimensionDropdown_stage.graphql'
import GitLabFieldMenu from './GitLabFieldMenu'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  clearError: () => void
  isFacilitator: boolean
  stageRef: GitLabFieldDimensionDropdown_stage$key
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

const GitLabFieldDimensionDropdown = (props: Props) => {
  const {clearError, stageRef, isFacilitator, submitScore} = props
  const stage = useFragment(
    graphql`
      fragment GitLabFieldDimensionDropdown_stage on EstimateStage {
        ...GitLabFieldMenu_stage
        finalScore
        serviceField {
          name
        }
      }
    `,
    stageRef
  )
  const {serviceField} = stage
  const {name: serviceFieldName} = serviceField
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLButtonElement>(
    MenuPosition.UPPER_RIGHT,
    {isDropdown: true}
  )

  const onClick = () => {
    if (!isFacilitator) return
    togglePortal()
    clearError()
  }

  const label = labelLookup[serviceFieldName]

  return (
    <>
      <Wrapper isFacilitator={isFacilitator} onClick={onClick} ref={originRef}>
        <CurrentValue>{label}</CurrentValue>
        <StyledIcon isFacilitator={isFacilitator}>{'expand_more'}</StyledIcon>
      </Wrapper>
      {menuPortal(
        <GitLabFieldMenu menuProps={menuProps} stageRef={stage} submitScore={submitScore} />
      )}
    </>
  )
}

export default GitLabFieldDimensionDropdown
