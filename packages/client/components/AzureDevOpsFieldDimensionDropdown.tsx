/*import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {ICON_SIZE} from '../styles/typographyV2'
import {SprintPokerDefaults} from '../types/constEnums'
import {AzureDevOpsFieldDimensionDropdown_stage$key} from '../__generated__/AzureDevOpsFieldDimensionDropdown_stage.graphql'
import Icon from './Icon'
//import JiraFieldMenu from './JiraFieldMenu'
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
  [SprintPokerDefaults.SERVICE_FIELD_NULL]: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL
}

const AzureDevOpsFieldDimensionDropdown = (props: Props) => {
  const {clearError, stageRef, isFacilitator, submitScore} = props

  const stage = useFragment(
    graphql`
      fragment AzureDevOpsFieldDimensionDropdown_stage on EstimateStage {
        ...AzureDevOpsFieldMenu_stage
        serviceField {
          name
        }
        task {
          integration {
            ... on AzureDevOpsWorkItem
          }
        }
      }
    `
  )
}
*/
