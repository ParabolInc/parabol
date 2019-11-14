import {RetroLobby_meetingSettings} from '../__generated__/RetroLobby_meetingSettings.graphql'
import {RetroLobby_team} from '../__generated__/RetroLobby_team.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import ErrorBoundary from './ErrorBoundary'
import LabelHeading from './LabelHeading/LabelHeading'
import MeetingContent from './MeetingContent'
import MeetingTopBar from './MeetingTopBar'
import MeetingHelpToggle from './MenuHelpToggle'
import NewMeetingLobby from './NewMeetingLobby'
import PrimaryButton from './PrimaryButton'
import {RetroMeetingPhaseProps} from './RetroMeeting'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import CopyShortLink from '../modules/meeting/components/CopyShortLink/CopyShortLink'
import MeetingCopy from '../modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingPhaseHeading from '../modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import StartNewMeetingMutation from '../mutations/StartNewMeetingMutation'
import {minWidthMediaQueries} from '../styles/breakpoints'
import {MeetingTypeEnum} from '../types/graphql'
import lazyPreload from '../utils/lazyPreload'
import makeHref from '../utils/makeHref'
import {meetingTypeToLabel, meetingTypeToSlug} from '../utils/meetings/lookups'
import RetroTemplatePicker from '../modules/meeting/components/RetroTemplatePicker'

const ButtonGroup = styled('div')({
  display: 'flex',
  paddingTop: '2.25rem'
})

const ButtonBlock = styled('div')({
  width: '16.125rem'
})

const textAlign = {
  textAlign: 'center' as 'center',
  [minWidthMediaQueries[2]]: {
    textAlign: 'left' as 'left'
  }
}

const StyledLabel = styled(LabelHeading)({...textAlign})
const StyledHeading = styled(MeetingPhaseHeading)({...textAlign})
const StyledCopy = styled(MeetingCopy)({...textAlign})

const UrlBlock = styled('div')({
  margin: '48px 0 0 -36px' // hang icon
})

interface Props extends RetroMeetingPhaseProps {
  team: RetroLobby_team
  meetingSettings: RetroLobby_meetingSettings
}

const StyledButton = styled(PrimaryButton)({
  width: '100%'
})

const TemplatePickerLabel = styled(LabelHeading)({
  margin: '0 0 .75rem'
})

const TemplatePickerBlock = styled('div')({
  margin: '3rem 0 0',
  width: '20rem'
})

const RetroLobbyHelpMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'RetroLobbyHelpMenu' */ './MeetingHelp/RetroLobbyHelpMenu')
)

const meetingType = MeetingTypeEnum.retrospective
const meetingLabel = meetingTypeToLabel[meetingType]
const meetingSlug = meetingTypeToSlug[meetingType]
const buttonLabel = `Start ${meetingLabel} Meeting`

const RetroLobby = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {onError, onCompleted, submitMutation, submitting} = useMutationProps()
  const {avatarGroup, toggleSidebar, meetingSettings, team} = props
  const {id: teamId, name: teamName, isMeetingSidebarCollapsed} = team
  const onStartMeetingClick = () => {
    if (submitting) return
    submitMutation()
    StartNewMeetingMutation(atmosphere, {teamId, meetingType}, {history, onError, onCompleted})
  }
  return (
    <MeetingContent>
      <MeetingTopBar
        avatarGroup={avatarGroup}
        isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      <ErrorBoundary>
        <NewMeetingLobby>
          <StyledLabel>{`${meetingLabel} Meeting Lobby`}</StyledLabel>
          <StyledHeading>{`${teamName} ${meetingLabel}`}</StyledHeading>
          <StyledCopy>
            {'The person who presses “Start Meeting” will be today’s Facilitator.'}
            <br />
            <br />
            {'Everyone’s display automatically follows the Facilitator.'}
          </StyledCopy>
          <ButtonGroup>
            <ButtonBlock>
              <StyledButton
                aria-label={buttonLabel}
                onClick={onStartMeetingClick}
                size='large'
                waiting={submitting}
              >
                {buttonLabel}
              </StyledButton>
            </ButtonBlock>
          </ButtonGroup>
          <TemplatePickerBlock>
            <TemplatePickerLabel>Current Template</TemplatePickerLabel>
            <RetroTemplatePicker settings={meetingSettings} />
          </TemplatePickerBlock>
          <UrlBlock>
            <CopyShortLink
              icon={'link'}
              url={makeHref(`/${meetingSlug}/${teamId}`)}
              title={'Copy Meeting Link'}
              tooltip={'Copied the meeting link!'}
            />
          </UrlBlock>
          <MeetingHelpToggle menu={<RetroLobbyHelpMenu />} />
        </NewMeetingLobby>
      </ErrorBoundary>
    </MeetingContent>
  )
}

export default createFragmentContainer(RetroLobby, {
  meetingSettings: graphql`
    fragment RetroLobby_meetingSettings on RetrospectiveMeetingSettings {
      ...RetroTemplatePicker_settings
    }
  `,
  team: graphql`
    fragment RetroLobby_team on Team {
      id
      name
      isMeetingSidebarCollapsed
    }
  `
})
