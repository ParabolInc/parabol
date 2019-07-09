import {ActionMeetingLobby_team} from '__generated__/ActionMeetingLobby_team.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {ActionMeetingPhaseProps} from 'universal/components/ActionMeeting'
import ErrorBoundary from 'universal/components/ErrorBoundary'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import MeetingContent from 'universal/components/MeetingContent'
import MeetingContentHeader from 'universal/components/MeetingContentHeader'
import MeetingHelpToggle from 'universal/components/MenuHelpToggle'
import NewMeetingLobby from 'universal/components/NewMeetingLobby'
import PrimaryButton from 'universal/components/PrimaryButton'
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

interface Props extends ActionMeetingPhaseProps {
  team: ActionMeetingLobby_team
}

const StyledButton = styled(PrimaryButton)({
  width: '100%'
})

const meetingType = MeetingTypeEnum.action
const meetingLabel = meetingTypeToLabel[meetingType]
const meetingSlug = meetingTypeToSlug[meetingType]
const buttonLabel = `Start ${meetingLabel} Meeting`

const ActionMeetingLobbyHelpMenu = lazyPreload(() =>
  import(/*WebpackChunkName: ActionMeetingLobbyHelpMenu*/ 'universal/components/MeetingHelp/ActionMeetingLobbyHelpMenu')
)

const ActionMeetingLobby = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {submitMutation, submitting, onError, onCompleted} = useMutationProps()
  const {avatarGroup, toggleSidebar, team} = props
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
            {'Everyone’s display automatically follows the Facilitator.'}
          </StyledCopy>
          <StyledCopy>
            <b>{'Today’s Facilitator'}</b>
            {`: begin the ${meetingLabel} Meeting!`}
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
          <UrlBlock>
            <CopyShortLink
              url={makeHref(`/${meetingSlug}/${teamId}`)}
              title={'Copy Meeting Link'}
              tooltip={'Copied the meeting link!'}
            />
          </UrlBlock>
          <MeetingHelpToggle menu={<ActionMeetingLobbyHelpMenu />} />
        </NewMeetingLobby>
      </ErrorBoundary>
    </MeetingContent>
  )
}

export default createFragmentContainer(
  ActionMeetingLobby,
  graphql`
    fragment ActionMeetingLobby_team on Team {
      id
      name
      isMeetingSidebarCollapsed
    }
  `
)
