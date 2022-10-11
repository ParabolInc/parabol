import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import useModal from '../hooks/useModal'
import UpdateJiraDimensionFieldMutation from '../mutations/UpdateJiraDimensionFieldMutation'
import {SprintPokerDefaults} from '../types/constEnums'
import {JiraFieldMenu_stage, JiraIssueMissingEstimationFieldHintEnum} from '../__generated__/JiraFieldMenu_stage.graphql'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemHR from './MenuItemHR'
import MenuItemLabel from './MenuItemLabel'

interface Props {
  missingField: JiraIssueMissingEstimationFieldHintEnum
}

const HintLabel = styled(MenuItemLabel)({
  fontStyle: 'italic'
})

const JiraMissingFieldModal = (props: Props) => {
  const {missingField} = props
  const atmosphere = useAtmosphere()

  const handleClickMissingField = (e: React.MouseEvent) => {
    if (missingField === 'companyManagedStoryPoints') {
      // goto company
    } else if (missingField === 'teamManagedStoryPoints') {
      // goto team
    }
  }

  return (
    <DialogContainer>
      <DialogTitle>Why does my Jira field not show up?</DialogTitle>
      <DialogContent>There are a couple of requirements for fields to show up
        <ul>
          <li>the field must appear on the edit screen of the issue</li>
          <li>only types "string" and "number" are supported</li>
          <li></li>
        </ul>
      </DialogContent>
    </DialogContainer>
  )
}

export default JiraMissingFieldModal

