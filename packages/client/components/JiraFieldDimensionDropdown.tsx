import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '~/styles/paletteV2'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {NewMeeting, SprintPokerDefaults} from '../types/constEnums'
import lazyPreload from '../utils/lazyPreload'
import {JiraFieldDimensionDropdown_stage} from '../__generated__/JiraFieldDimensionDropdown_stage.graphql'
import DropdownToggleV2 from './DropdownToggleV2'
import MenuToggleV2Text from './MenuToggleV2Text'

const JiraFieldMenuRoot = lazyPreload(async () =>
  import(/* webpackChunkName: 'JiraFieldMenuRoot' */ './JiraFieldMenuRoot')
)

interface Props {
  stage: JiraFieldDimensionDropdown_stage

}

const Dropdown = styled(DropdownToggleV2)({
  backgroundColor: '#fff',
  width: NewMeeting.CONTROLS_WIDTH,
  ':hover': {
    backgroundColor: PALETTE.BACKGROUND_MAIN_LIGHTENED
  }
})

const labelLookup = {
  [SprintPokerDefaults.JIRA_FIELD_COMMENT]: SprintPokerDefaults.JIRA_FIELD_COMMENT_LABEL,
  [SprintPokerDefaults.JIRA_FIELD_NULL]: SprintPokerDefaults.JIRA_FIELD_NULL_LABEL,
}

const JiraFieldDimensionDropdown = (props: Props) => {
  const {stage} = props
  const {serviceFieldName} = stage
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT,
    {
      isDropdown: true
    }
  )

  const label = labelLookup[serviceFieldName] || serviceFieldName
  return (
    <>
      <Dropdown
        onMouseEnter={JiraFieldMenuRoot.preload}
        onClick={togglePortal}
        ref={originRef}
      >
        <MenuToggleV2Text icon={'stop'} label={label} />
      </Dropdown>
      {menuPortal(
        <JiraFieldMenuRoot menuProps={menuProps} stage={stage} />
      )}
    </>
  )
}

export default createFragmentContainer(JiraFieldDimensionDropdown,
  {
    stage: graphql`
    fragment JiraFieldDimensionDropdown_stage on EstimateStage {
      ...JiraFieldMenuRoot_stage
      serviceFieldName
    }
    `
  }
)
