import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '~/styles/paletteV2'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {ICON_SIZE} from '../styles/typographyV2'
import {SprintPokerDefaults} from '../types/constEnums'
import lazyPreload from '../utils/lazyPreload'
import {JiraFieldDimensionDropdown_stage} from '../__generated__/JiraFieldDimensionDropdown_stage.graphql'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

const JiraFieldMenuRoot = lazyPreload(async () =>
  import(/* webpackChunkName: 'JiraFieldMenuRoot' */ './JiraFieldMenuRoot')
)

interface Props {
  clearError: () => void
  isFacilitator: boolean
  stage: JiraFieldDimensionDropdown_stage

}

const Wrapper = styled(PlainButton)<{
  isFacilitator: boolean
}>(({
  isFacilitator
}) => ({
  cursor: isFacilitator ? undefined : 'default',
  display: 'flex',
  color: PALETTE.TEXT_MAIN,
  ':hover': {
    color: isFacilitator ? PALETTE.TEXT_LIGHT_DARK : undefined
  },
  userSelect: 'none'
}))


const CurrentValue = styled('div')<{
  isFacilitator: boolean
}>(({
  isFacilitator
}) => ({
  fontSize: 14,
  fontWeight: 600,
  textDecoration: isFacilitator ? 'underline' : undefined
}))

const StyledIcon = styled(Icon)<{
  isFacilitator: boolean
}>(({
  isFacilitator
}) => ({
  fontSize: ICON_SIZE.MD18,
  visibility: isFacilitator ? undefined : 'hidden'
}))

const labelLookup = {
  [SprintPokerDefaults.JIRA_FIELD_COMMENT]: SprintPokerDefaults.JIRA_FIELD_COMMENT_LABEL,
  [SprintPokerDefaults.JIRA_FIELD_NULL]: SprintPokerDefaults.JIRA_FIELD_NULL_LABEL,
}

const JiraFieldDimensionDropdown = (props: Props) => {
  const {clearError, stage, isFacilitator} = props
  const {serviceField} = stage
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

  const label = labelLookup[serviceFieldName] || serviceFieldName
  return (
    <Wrapper onMouseEnter={JiraFieldMenuRoot.preload} isFacilitator={isFacilitator}
      onClick={onClick}
      ref={originRef}>
      <CurrentValue isFacilitator={isFacilitator}>{label}</CurrentValue>
      <StyledIcon isFacilitator={isFacilitator}>{'expand_more'}</StyledIcon>
      {menuPortal(
        <JiraFieldMenuRoot menuProps={menuProps} stage={stage} />
      )}
    </Wrapper>
  )
}

export default createFragmentContainer(JiraFieldDimensionDropdown,
  {
    stage: graphql`
    fragment JiraFieldDimensionDropdown_stage on EstimateStage {
      ...JiraFieldMenuRoot_stage
      serviceField {
        name
      }
    }
    `
  }
)
