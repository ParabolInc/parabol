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
  stage: JiraFieldDimensionDropdown_stage

}

const Wrapper = styled(PlainButton)({
  display: 'flex',
  color: PALETTE.TEXT_MAIN,
  ':hover': {
    color: PALETTE.TEXT_LIGHT_DARK
  },
  userSelect: 'none'
})

const CurrentValue = styled('div')({
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'underline'
})

const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18
})

const labelLookup = {
  [SprintPokerDefaults.JIRA_FIELD_COMMENT]: SprintPokerDefaults.JIRA_FIELD_COMMENT_LABEL,
  [SprintPokerDefaults.JIRA_FIELD_NULL]: SprintPokerDefaults.JIRA_FIELD_NULL_LABEL,
}

const JiraFieldDimensionDropdown = (props: Props) => {
  const {stage} = props
  const {serviceField} = stage
  const {name: serviceFieldName} = serviceField
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLButtonElement>(
    MenuPosition.UPPER_RIGHT,
    {
      isDropdown: true
    }
  )

  const label = labelLookup[serviceFieldName] || serviceFieldName
  return (
    <Wrapper onMouseEnter={JiraFieldMenuRoot.preload}
      onClick={togglePortal}
      ref={originRef}>
      <CurrentValue>{label}</CurrentValue>
      <StyledIcon>{'expand_more'}</StyledIcon>
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
