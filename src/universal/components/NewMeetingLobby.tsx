import {NewMeetingLobby_team} from '__generated__/NewMeetingLobby_team.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import InlineAlert from 'universal/components/InlineAlert'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import LoadableModal from 'universal/components/LoadableModal'
import RetroLobbyHelpMenu from 'universal/components/MeetingHelp/RetroLobbyHelpMenu'
import PrimaryButton from 'universal/components/PrimaryButton'
import UpgradeModalRootLoadable from 'universal/components/UpgradeModalRootLoadable'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink'
import MeetingCopy from 'universal/modules/meeting/components/MeetingCopy/MeetingCopy'
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import StartNewMeetingMutation from 'universal/mutations/StartNewMeetingMutation'
import {minWidthMediaQueries} from 'universal/styles/breakpoints'
import {meetingSplashGutter} from 'universal/styles/meeting'
import ui from 'universal/styles/ui'
import {PRO} from 'universal/utils/constants'
import makeHref from 'universal/utils/makeHref'
import {meetingTypeToLabel, meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import RetroTemplatePicker from '../modules/meeting/components/RetroTemplatePicker'

import MeetingTypeEnum = GQL.MeetingTypeEnum

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
  atmosphere: Object
  meetingType: MeetingTypeEnum
  team: NewMeetingLobby_team
}

const StyledInlineAlert = styled(InlineAlert)({
  display: 'inline-block',
  paddingLeft: '1rem',
  paddingRight: '1rem'
})

const AlertAction = styled('span')({
  color: ui.palette.mid,
  cursor: 'pointer',
  fontWeight: 600,
  textDecoration: 'underline'
})

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
    const {meetingSettings, orgId, organization, teamId, teamName} = team
    const {retroMeetingsOffered, retroMeetingsRemaining, tier} = organization
    const onStartMeetingClick = () => {
      submitMutation()
      StartNewMeetingMutation(atmosphere, {teamId, meetingType}, {history}, onError, onCompleted)
    }
    const isPro = tier === PRO
    const canStartMeeting = isPro || retroMeetingsRemaining > 0
    const meetingLabel = meetingTypeToLabel[meetingType]
    const meetingSlug = meetingTypeToSlug[meetingType]
    const buttonLabel = `Start ${meetingLabel} Meeting`
    return (
      <Lobby>
        <StyledLabel>{`${meetingLabel} Meeting Lobby`}</StyledLabel>
        <StyledHeading>{`${teamName} ${meetingLabel}`}</StyledHeading>
        {isPro ? (
          <StyledCopy>
            {'The person who presses “Start Meeting” will be today’s Facilitator.'}
            <br />
            <br />
            {'Everyone’s display automatically follows the Facilitator.'}
          </StyledCopy>
        ) : (
          <StyledCopy>
            {
              'Running a retrospective is the most effective way to learn how your team can work smarter.'
            }
            <br />
            <br />
            {
              'In 30 minutes you can discover underlying tensions, create next steps, and have a summary delivered to your inbox.'
            }
          </StyledCopy>
        )}
        {!isPro && (
          <StyledInlineAlert>
            <span
            >{`${retroMeetingsRemaining} of ${retroMeetingsOffered} Meetings Remaining — `}</span>
            <LoadableModal
              LoadableComponent={UpgradeModalRootLoadable}
              queryVars={{orgId}}
              toggle={<AlertAction>Upgrade to Pro</AlertAction>}
            />
            <span>{' to unlock unlimited retrospectives'}</span>
          </StyledInlineAlert>
        )}
        <ButtonGroup>
          <ButtonBlock>
            {(isPro || retroMeetingsRemaining > 0) && (
              <StyledButton
                aria-label={buttonLabel}
                depth={1}
                disabled={!canStartMeeting}
                onClick={onStartMeetingClick}
                size='large'
                waiting={submitting}
              >
                {buttonLabel}
              </StyledButton>
            )}
            {!isPro &&
              retroMeetingsRemaining === 0 && (
                <LoadableModal
                  LoadableComponent={UpgradeModalRootLoadable}
                  queryVars={{orgId}}
                  toggle={
                    <StyledButton aria-label='Get Access Now' size='large' depth={1}>
                      {'Get Access Now'}
                    </StyledButton>
                  }
                />
              )}
          </ButtonBlock>
        </ButtonGroup>
        <TemplatePickerBlock>
          <TemplatePickerLabel>Current Template</TemplatePickerLabel>
          <RetroTemplatePicker settings={meetingSettings} />
        </TemplatePickerBlock>
        <UrlBlock>
          <CopyShortLink url={makeHref(`/${meetingSlug}/${teamId}`)} />
        </UrlBlock>
        <RetroLobbyHelpMenu isPro={isPro} />
      </Lobby>
    )
  }
}

export default createFragmentContainer(
  withRouter(withAtmosphere(withMutationProps(NewMeetingLobby))),
  graphql`
    fragment NewMeetingLobby_team on Team {
      teamId: id
      teamName: name
      orgId
      organization {
        retroMeetingsOffered
        retroMeetingsRemaining
        tier
      }
      meetingSettings(meetingType: $meetingType) {
        ...RetroTemplatePicker_settings
      }
    }
  `
)
