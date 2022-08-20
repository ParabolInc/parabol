import styled from '@emotion/styled'
import {ExpandMore} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import interpolateGitHubLabelTemplate from '../shared/interpolateGitHubLabelTemplate'
import {SprintPokerDefaults} from '../types/constEnums'
import {GitHubFieldDimensionDropdown_stage$key} from '../__generated__/GitHubFieldDimensionDropdown_stage.graphql'
import GitHubFieldMenu from './GitHubFieldMenu'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  clearError: () => void
  isFacilitator: boolean
  stageRef: GitHubFieldDimensionDropdown_stage$key
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

const StyledIcon = styled(ExpandMore)<{isFacilitator: boolean}>(({isFacilitator}) => ({
  height: 18,
  width: 18,
  display: isFacilitator ? undefined : 'none'
}))

const labelLookup = {
  [SprintPokerDefaults.SERVICE_FIELD_COMMENT]: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
  [SprintPokerDefaults.SERVICE_FIELD_NULL]: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL
}

const GitHubFieldDimensionDropdown = (props: Props) => {
  const {clearError, stageRef, isFacilitator, submitScore} = props
  const stage = useFragment(
    graphql`
      fragment GitHubFieldDimensionDropdown_stage on EstimateStage {
        ...GitHubFieldMenu_stage
        finalScore
        serviceField {
          name
        }
      }
    `,
    stageRef
  )
  const {finalScore, serviceField} = stage
  const {name: serviceFieldName} = serviceField
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLButtonElement>(
    MenuPosition.UPPER_RIGHT,
    {
      isDropdown: true,
      id: 'githubFieldMenu'
    }
  )

  const onClick = () => {
    if (!isFacilitator) return
    togglePortal()
    clearError()
  }

  const label =
    labelLookup[serviceFieldName] || interpolateGitHubLabelTemplate(serviceFieldName, finalScore)

  return (
    <>
      <Wrapper isFacilitator={isFacilitator} onClick={onClick} ref={originRef}>
        <CurrentValue>{label}</CurrentValue>
        <StyledIcon isFacilitator={isFacilitator} />
      </Wrapper>
      {menuPortal(
        <GitHubFieldMenu menuProps={menuProps} stageRef={stage} submitScore={submitScore} />
      )}
    </>
  )
}

export default GitHubFieldDimensionDropdown
