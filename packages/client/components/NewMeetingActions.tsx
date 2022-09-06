import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useFragment} from 'react-relay'
import {NewMeetingActions_team$key} from '~/__generated__/NewMeetingActions_team.graphql'
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
  [narrowScreenMediaQuery]: {
    flexDirection: 'column',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    alignContent: 'center',
    alignSelf: 'center',
    marginTop: 'auto',
    paddingBottom: '24px'
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
  teamRef: NewMeetingActions_team$key
  onStartMeetingClick: () => void
  submitting: boolean
}

const NewMeetingActions = (props: Props) => {
  const {teamRef, onStartMeetingClick, submitting, error} = props

  const {t} = useTranslation()

  const team = useFragment(
    graphql`
      fragment NewMeetingActions_team on Team {
        ...NewMeetingActionsCurrentMeetings_team
        id
      }
    `,
    teamRef
  )

  return (
    <ActionRow>
      <ActiveMeetingsBlock>
        <NewMeetingActionsCurrentMeetings team={team} />
        {error && <StyledError>{error.message}</StyledError>}
      </ActiveMeetingsBlock>
      <ButtonBlock>
        <StartButton onClick={onStartMeetingClick} waiting={submitting}>
          {t('NewMeetingActions.StartMeeting')}
        </StartButton>
      </ButtonBlock>
    </ActionRow>
  )
}

export default NewMeetingActions
