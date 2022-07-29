import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {NewMeetingActions_team} from '~/__generated__/NewMeetingActions_team.graphql'
import {Breakpoint} from '../types/constEnums'
import FlatPrimaryButton from './FlatPrimaryButton'
import NewMeetingActionsCurrentMeetings from './NewMeetingActionsCurrentMeetings'
import StyledError from './StyledError'

const narrowScreenMediaQuery = `@media screen and (max-width: ${Breakpoint.FUZZY_TABLET}px)`

const ActionRow = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  padding: 24,
  paddingTop: 16,
  [narrowScreenMediaQuery]: {
    flexDirection: 'column'
  }
})

const ActiveMeetingsBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  flexGrow: 10,
  [narrowScreenMediaQuery]: {
    paddingBottom: 24
  }
})

const ButtonBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap'
})

const StartButton = styled(FlatPrimaryButton)({
  fontSize: 20,
  height: 50
})

interface Props {
  error?: {message: string}
  team: NewMeetingActions_team
  onStartMeetingClick: () => void
  submitting: boolean
}

const NewMeetingActions = (props: Props) => {
  const {team, onStartMeetingClick, submitting, error} = props

  return (
    <ActionRow>
      <ActiveMeetingsBlock>
        <NewMeetingActionsCurrentMeetings team={team} />
        {error && <StyledError>{error.message}</StyledError>}
      </ActiveMeetingsBlock>
      <ButtonBlock>
        <StartButton onClick={onStartMeetingClick} waiting={submitting}>
          Start Meeting
        </StartButton>
      </ButtonBlock>
    </ActionRow>
  )
}

export default createFragmentContainer(NewMeetingActions, {
  team: graphql`
    fragment NewMeetingActions_team on Team {
      ...NewMeetingActionsCurrentMeetings_team
      id
    }
  `
})
