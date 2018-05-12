// @flow
import * as React from 'react'
import {createFragmentContainer} from 'react-relay'
import type {RouterHistory} from 'react-router-dom'
import {withRouter} from 'react-router-dom'
import Button from 'universal/components/Button/Button'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import type {MutationProps} from 'universal/utils/relay/withMutationProps'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {PRO} from 'universal/utils/constants'
import styled from 'react-emotion'
import LoadableModal from 'universal/components/LoadableModal'
import GetRetroAccessLoadable from 'universal/components/GetRetroAccessLoadable'
import type {NewMeetingLobby_team as Team} from './__generated__/NewMeetingLobby_team.graphql'
import type {MeetingTypeEnum} from 'universal/types/schema.flow'
import StartNewMeetingMutation from 'universal/mutations/StartNewMeetingMutation'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading'
import ui from 'universal/styles/ui'
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink'
import makeHref from 'universal/utils/makeHref'
import {meetingTypeToLabel, meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import MeetingCopy from 'universal/modules/meeting/components/MeetingCopy/MeetingCopy'

const ButtonBlock = styled('div')({
  margin: '0',
  paddingTop: '2.25rem',
  width: '13rem'
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

const RetroExpository = styled('div')({
  fontWeight: 300
})

const GetAccessCopy = styled('div')({
  fontWeight: 300
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

const NewMeetingLobby = (props: Props) => {
  const {
    atmosphere,
    history,
    onError,
    onCompleted,
    meetingType,
    submitMutation,
    submitting,
    team
  } = props
  const {
    meetingSettings: {meetingsOffered, meetingsRemaining},
    teamId,
    teamName,
    tier
  } = team
  const onStartMeetingClick = () => {
    submitMutation()
    StartNewMeetingMutation(atmosphere, {teamId, meetingType}, {history}, onError, onCompleted)
  }
  const isPro = tier === PRO
  const canStartMeeting = isPro || meetingsRemaining > 0
  const meetingLabel = meetingTypeToLabel[meetingType]
  const meetingSlug = meetingTypeToSlug[meetingType]
  return (
    <Lobby>
      <LabelHeading>{`${meetingLabel} Meeting Lobby`}</LabelHeading>
      <MeetingPhaseHeading>{`${teamName} ${meetingLabel}`}</MeetingPhaseHeading>
      {!isPro && (
        <RetroExpository>
          {
            'A retrospective lets your team reflect on past work and discover opportunities for how to work better in the future'
          }
        </RetroExpository>
      )}
      {!isPro &&
        !meetingsOffered && (
          <GetAccessCopy>
            <span>
              {'As a free user, you can start running retrospectives immediately with your team'}
            </span>
            <LoadableModal
              LoadableComponent={GetRetroAccessLoadable}
              maxWidth={350}
              maxHeight={225}
              toggle={
                <Button
                  aria-label='Get Access Now'
                  buttonSize='large'
                  buttonStyle='solid'
                  colorPalette='cool'
                  depth={1}
                  isBlock
                  label='GET ACCESS NOW'
                  textTransform='uppercase'
                />
              }
            />
          </GetAccessCopy>
        )}
      <MeetingCopy>
        {'The person who presses “Start Meeting” will be today’s Facilitator.'}
        <br />
        {'Everyone’s display automatically follows the Facilitator.'}
      </MeetingCopy>
      <ButtonBlock>
        <Button
          buttonStyle='primary'
          colorPalette='warm'
          disabled={!canStartMeeting}
          label={`Start ${meetingLabel} Meeting`}
          onClick={onStartMeetingClick}
          buttonSize='large'
          waiting={submitting}
        />
      </ButtonBlock>
      <UrlBlock>
        <CopyShortLink url={makeHref(`/${meetingSlug}/${teamId}`)} />
      </UrlBlock>
    </Lobby>
  )
}

export default createFragmentContainer(
  withRouter(withAtmosphere(withMutationProps(NewMeetingLobby))),
  graphql`
    fragment NewMeetingLobby_team on Team {
      tier
      meetingSettings(meetingType: $meetingType) {
        meetingsOffered
        meetingsRemaining
      }
      teamId: id
      teamName: name
    }
  `
)
