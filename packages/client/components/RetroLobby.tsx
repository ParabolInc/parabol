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
import MeetingStyles from './MeetingStyles'
import useLegacyLobby from '../hooks/useLegacyLobby'
import NewMeetingAvatarGroup from '../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import {RetroLobby_viewer} from '__generated__/RetroLobby_viewer.graphql'
import Icon from '../components/Icon'
import FlatButton from '../components/FlatButton'
import {PALETTE} from '../styles/paletteV2'

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

const IconButton = styled(FlatButton)({
  color: PALETTE.TEXT_GRAY,
  marginLeft: -8,
  marginTop: -4,
  padding: '3px 0',
  width: 32,
  ':hover,:focus,:active': {
    color: PALETTE.TEXT_MAIN
  }
})

const BackIcon = styled(Icon)({
  color: 'inherit'
})

const StyledLabel = styled(LabelHeading)({...textAlign})
const StyledHeading = styled(MeetingPhaseHeading)({...textAlign})
const StyledCopy = styled(MeetingCopy)({...textAlign})

const UrlBlock = styled('div')({
  margin: '48px 0 0 -36px' // hang icon
})

interface Props {
  viewer: RetroLobby_viewer
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
  const {viewer} = props
  const team = viewer.team!
  useLegacyLobby(team)
  const {id: teamId, name: teamName, meetingSettings} = team
  const onStartMeetingClick = () => {
    if (submitting) return
    submitMutation()
    StartNewMeetingMutation(atmosphere, {teamId, meetingType}, {history, onError, onCompleted})
  }
  const goToTeamDashboard = () => {
    history.push(`/team/${teamId}/`)
  }
  return (
    <MeetingStyles>
      <MeetingContent>
        <MeetingTopBar
          avatarGroup={
            <NewMeetingAvatarGroup allowVideo={false} camStreams={{}} swarm={null} team={team} />
          }
          isMeetingSidebarCollapsed={false}
          toggleSidebar={() => {}}
        >
          <IconButton aria-label='Back to Team Dashboard' onClick={goToTeamDashboard}>
            <BackIcon>arrow_back</BackIcon>
          </IconButton>
        </MeetingTopBar>
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
    </MeetingStyles>
  )
}

export default createFragmentContainer(RetroLobby, {
  viewer: graphql`
    fragment RetroLobby_viewer on User {
      team(teamId: $teamId) {
        ...useLegacyLobby_team
        ...NewMeetingAvatarGroup_team
        id
        name
        meetingSettings(meetingType: retrospective) {
          ...RetroTemplatePicker_settings
        }
      }
    }
  `
})
