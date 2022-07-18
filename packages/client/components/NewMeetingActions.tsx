import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import StartCheckInMutation from '~/mutations/StartCheckInMutation'
import StartRetrospectiveMutation from '~/mutations/StartRetrospectiveMutation'
import StartTeamPromptMutation from '~/mutations/StartTeamPromptMutation'
import {NewMeetingActions_team} from '~/__generated__/NewMeetingActions_team.graphql'
import {MeetingTypeEnum} from '~/__generated__/NewMeetingQuery.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import StartSprintPokerMutation from '../mutations/StartSprintPokerMutation'
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
  paddingTop: 16
})

const ActiveMeetingsBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  flexGrow: 10,
  paddingTop: 8
})

const ButtonBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  flexGrow: 1,
  paddingTop: 8
})

const StartButton = styled(FlatPrimaryButton)({
  fontSize: 20,
  height: 50,
  [narrowScreenMediaQuery]: {
    paddingLeft: 16,
    paddingRight: 16,
    marginLeft: 'auto'
  }
})

interface Props {
  meetingType: MeetingTypeEnum
  team: NewMeetingActions_team
  onClose: () => void
}

const NewMeetingActions = (props: Props) => {
  const {team, meetingType} = props
  const {id: teamId} = team
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {submitMutation, error, submitting, onError, onCompleted} = useMutationProps()
  const onStartMeetingClick = () => {
    if (submitting) return
    submitMutation()
    if (meetingType === 'poker') {
      StartSprintPokerMutation(atmosphere, {teamId}, {history, onError, onCompleted})
    } else if (meetingType === 'action') {
      StartCheckInMutation(atmosphere, {teamId}, {history, onError, onCompleted})
    } else if (meetingType === 'retrospective') {
      StartRetrospectiveMutation(atmosphere, {teamId}, {history, onError, onCompleted})
    } else if (meetingType === 'teamPrompt') {
      StartTeamPromptMutation(atmosphere, {teamId}, {history, onError, onCompleted})
    }
  }

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
