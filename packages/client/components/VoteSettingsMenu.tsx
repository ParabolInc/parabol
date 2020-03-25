import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from 'styles/paletteV2'
import {VoteSettingsMenu_meeting} from '__generated__/VoteSettingsMenu_meeting.graphql'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import VoteStepper from './VoteSettingsStepper'

interface Props {
  menuProps: MenuProps
  meeting: VoteSettingsMenu_meeting
}

const VoteOption = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 16px',
  fontWeight: 600,
  color: PALETTE.TEXT_GRAY,
  fontSize: 14
})

const Label = styled('div')({})

const VoteSettingsMenu = (props: Props) => {
  const {menuProps, meeting} = props
  const {id: meetingId} = props
  const {portalStatus, isDropdown} = menuProps
  return (
    <Menu ariaLabel='Adjust the vote count' portalStatus={portalStatus} isDropdown={isDropdown}>
      <VoteOption>
        <Label>Votes per participant</Label>
        <VoteStepper field={'totalVotes'} value={5} />
      </VoteOption>
      <VoteOption>
        <Label>Votes per topic</Label>
        <VoteStepper field={'maxVotesPerGroup'} value={3} />
      </VoteOption>
    </Menu>
  )
}

export default createFragmentContainer(VoteSettingsMenu, {
  meeting: graphql`
    fragment VoteSettingsMenu_meeting on RetrospectiveMeeting {
      id
    }
  `
})
