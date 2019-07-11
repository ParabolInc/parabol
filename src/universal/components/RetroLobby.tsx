import {RetroLobby_meetingSettings} from '__generated__/RetroLobby_meetingSettings.graphql'
import {RetroLobby_team} from '__generated__/RetroLobby_team.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import MeetingContent from 'universal/components/MeetingContent'
import MeetingContentHeader from 'universal/components/MeetingContentHeader'
import MeetingHelpToggle from 'universal/components/MenuHelpToggle'
import NewMeetingLobby from 'universal/components/NewMeetingLobby'
import PrimaryButton from 'universal/components/PrimaryButton'
import {RetroMeetingPhaseProps} from 'universal/components/RetroMeeting'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useMutationProps from 'universal/hooks/useMutationProps'
import useRouter from 'universal/hooks/useRouter'
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink'
import MeetingCopy from 'universal/modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import StartNewMeetingMutation from 'universal/mutations/StartNewMeetingMutation'
import {minWidthMediaQueries} from 'universal/styles/breakpoints'
import {MeetingTypeEnum} from 'universal/types/graphql'
import lazyPreload from 'universal/utils/lazyPreload'
import makeHref from 'universal/utils/makeHref'
import {meetingTypeToLabel, meetingTypeToSlug} from 'universal/utils/meetings/lookups'
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
  margin: '3rem 0 0',
  display: 'inline-block',
  verticalAlign: 'middle'
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
  import(/* webpackChunkName: 'RetroLobbyHelpMenu' */ 'universal/components/MeetingHelp/RetroLobbyHelpMenu')
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
      <MeetingContentHeader
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
