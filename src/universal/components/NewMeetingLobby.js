// @flow
import * as React from 'react'
import type {RouterHistory} from 'react-router-dom'
import PrimaryButton from 'universal/components/PrimaryButton'
import type {MutationProps} from 'universal/utils/relay/withMutationProps'
import {PRO} from 'universal/utils/constants'
import styled from 'react-emotion'
import LoadableModal from 'universal/components/LoadableModal'
import type {NewMeetingLobby_team as Team} from './__generated__/NewMeetingLobby_team.graphql'
import type {MeetingTypeEnum} from 'universal/types/schema.flow'
import StartNewMeetingMutation from 'universal/mutations/StartNewMeetingMutation'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import ui from 'universal/styles/ui'
import {meetingTypeToLabel, meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import MeetingCopy from 'universal/modules/meeting/components/MeetingCopy/MeetingCopy'
import makeHref from 'universal/utils/makeHref'
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {withRouter} from 'react-router-dom'
import UpgradeModalRootLoadable from 'universal/components/UpgradeModalRootLoadable'
import InlineAlert from 'universal/components/InlineAlert'

const ButtonGroup = styled('div')({
  display: 'flex',
  paddingTop: '2.25rem'
})

const ButtonBlock = styled('div')({
  padding: '0 2rem 0 0',
  width: '18.125rem'
})

const Lobby = styled('div')({
  paddingLeft: ui.meetingSplashGutter,
  paddingTop: '2rem',
  textAlign: 'left',

  [ui.breakpoint.wide]: {
    paddingTop: '3rem'
  },
  [ui.breakpoint.wider]: {
    paddingTop: '4rem'
  },
  [ui.breakpoint.widest]: {
    paddingTop: '6rem'
  }
})

const UrlBlock = styled('div')({
  margin: '3rem 0 0',
  display: 'inline-block',
  verticalAlign: 'middle'
})

type Props = {
  atmosphere: Object,
  history: RouterHistory,
  meetingType: MeetingTypeEnum,
  team: Team,
  ...MutationProps
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
    const {orgId, organization, teamId, teamName} = team
    const {retroMeetingsOffered, retroMeetingsRemaining, tier} = organization
    const onStartMeetingClick = () => {
      submitMutation()
      StartNewMeetingMutation(atmosphere, {teamId, meetingType}, {history}, onError, onCompleted)
    }
    const isPro = tier === PRO

    // const isPro = true;
    const canStartMeeting = isPro || retroMeetingsRemaining > 0
    const meetingLabel = meetingTypeToLabel[meetingType]
    const meetingSlug = meetingTypeToSlug[meetingType]
    const buttonLabel = `Start ${meetingLabel} Meeting`
    return (
      <Lobby>
        <LabelHeading>{`${meetingLabel} Meeting Lobby`}</LabelHeading>
        <MeetingPhaseHeading>{`${teamName} ${meetingLabel}`}</MeetingPhaseHeading>
        {isPro ? (
          <MeetingCopy>
            {'The person who presses “Start Meeting” will be today’s Facilitator.'}
            <br />
            {'Everyone’s display automatically follows the Facilitator.'}
          </MeetingCopy>
        ) : (
          <MeetingCopy>
            {
              'Running a retrospective is the most effective way to learn how your team can work smarter.'
            }
            <br />
            {
              'In 30 minutes you can discover underlying tensions, create next steps, and have a summary delivered to your inbox.'
            }
          </MeetingCopy>
        )}
        {!isPro && (
          <StyledInlineAlert>
            <span
            >{`${retroMeetingsRemaining} of ${retroMeetingsOffered} Meetings Remaining — `}</span>
            <LoadableModal
              LoadableComponent={UpgradeModalRootLoadable}
              maxWidth={350}
              maxHeight={225}
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
                  maxWidth={350}
                  maxHeight={225}
                  onClose={this.updateInitialTier}
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
        <UrlBlock>
          <CopyShortLink url={makeHref(`/${meetingSlug}/${teamId}`)} />
        </UrlBlock>
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
    }
  `
)
