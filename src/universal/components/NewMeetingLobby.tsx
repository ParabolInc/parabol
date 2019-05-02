import {NewMeetingLobby_team} from '__generated__/NewMeetingLobby_team.graphql'
import React from 'react'
import styled from 'react-emotion'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import MeetingHelpToggle from 'universal/components/MenuHelpToggle'
import PrimaryButton from 'universal/components/PrimaryButton'
import {WithAtmosphereProps} from 'universal/decorators/withAtmosphere/withAtmosphere'
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink'
import MeetingCopy from 'universal/modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import StartNewMeetingMutation from 'universal/mutations/StartNewMeetingMutation'
import {minWidthMediaQueries} from 'universal/styles/breakpoints'
import {meetingSplashGutter} from 'universal/styles/meeting'
import {MeetingTypeEnum} from 'universal/types/graphql'
import lazyPreload from 'universal/utils/lazyPreload'
import makeHref from 'universal/utils/makeHref'
import {meetingTypeToLabel, meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import RetroTemplatePicker from '../modules/meeting/components/RetroTemplatePicker'

const ButtonGroup = styled('div')({
  display: 'flex',
  paddingTop: '2.25rem'
})

const ButtonBlock = styled('div')({
  width: '16.125rem'
})

const textAlign = {
  textAlign: 'center',

  [minWidthMediaQueries[2]]: {
    textAlign: 'left'
  }
}

// @ts-ignore
const StyledLabel = styled(LabelHeading)({...textAlign})
// @ts-ignore
const StyledHeading = styled(MeetingPhaseHeading)({...textAlign})
// @ts-ignore
const StyledCopy = styled(MeetingCopy)({...textAlign})

const Lobby = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexBasis: 'auto',
  flexDirection: 'column',
  flexGrow: 1,
  flexShrink: 0,
  justifyContent: 'center',
  padding: '2rem 4rem',
  textAlign: 'left',
  width: '100%',

  [minWidthMediaQueries[1]]: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },

  [minWidthMediaQueries[2]]: {
    paddingLeft: meetingSplashGutter
  },

  [minWidthMediaQueries[3]]: {
    paddingBottom: '3rem',
    paddingTop: '3rem'
  },
  [minWidthMediaQueries[4]]: {
    paddingBottom: '4rem',
    paddingTop: '4rem'
  },
  [minWidthMediaQueries[5]]: {
    paddingBottom: '6rem',
    paddingTop: '6rem'
  }
})

const UrlBlock = styled('div')({
  margin: '3rem 0 0',
  display: 'inline-block',
  verticalAlign: 'middle'
})

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps<{}> {
  meetingType: MeetingTypeEnum
  team: NewMeetingLobby_team
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

class NewMeetingLobby extends React.Component<Props> {
  render () {
    const {
      atmosphere,
      history,
      onError,
      onCompleted,
      meetingType,
      submitMutation,
      submitting,
      team
    } = this.props
    const {meetingSettings, teamId, teamName} = team
    const onStartMeetingClick = () => {
      submitMutation()
      StartNewMeetingMutation(atmosphere, {teamId, meetingType}, {history}, onError, onCompleted)
    }
    const meetingLabel = meetingTypeToLabel[meetingType]
    const meetingSlug = meetingTypeToSlug[meetingType]
    const buttonLabel = `Start ${meetingLabel} Meeting`
    return (
      <Lobby>
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
          <CopyShortLink url={makeHref(`/${meetingSlug}/${teamId}`)} />
        </UrlBlock>
        <MeetingHelpToggle menu={<RetroLobbyHelpMenu />} />
      </Lobby>
    )
  }
}

export default withRouter(NewMeetingLobby)
