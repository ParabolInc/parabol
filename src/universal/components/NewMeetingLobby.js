// @flow
import * as React from 'react';
import {createFragmentContainer} from 'react-relay';
import type {RouterHistory} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import Button from 'universal/components/Button/Button';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import {PRO} from 'universal/utils/constants';
import styled from 'react-emotion';
import LoadableModal from 'universal/components/LoadableModal';
import UpgradeModalLoadable from 'universal/components/UpgradeModalLoadable';
import type {NewMeetingLobby_team as Team} from './__generated__/NewMeetingLobby_team.graphql';
import type {MeetingTypeEnum} from 'universal/types/schema.flow';
import StartNewMeetingMutation from 'universal/mutations/StartNewMeetingMutation';
import LabelHeading from 'universal/components/LabelHeading/LabelHeading';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';
import ui from 'universal/styles/ui';
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink';
import makeHref from 'universal/utils/makeHref';
import {meetingTypeToLabel, meetingTypeToSlug} from 'universal/utils/meetings/lookups';
import MeetingCopy from 'universal/modules/meeting/components/MeetingCopy/MeetingCopy';

const ButtonGroup = styled('div')({
  display: 'flex',
  paddingTop: '2.25rem'
});

const ButtonBlock = styled('div')({
  padding: '0 2rem 0 0',
  width: '18.125rem'
});

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
});


const UrlBlock = styled('div')({
  margin: '3rem 0 0',
  display: 'inline-block',
  verticalAlign: 'middle'
});

type Props = {
  atmosphere: Object,
  history: RouterHistory,
  meetingType: MeetingTypeEnum,
  team: Team,
  ...MutationProps
};

const NewMeetingLobby = (props: Props) => {
  const {atmosphere, history, onError, onCompleted, meetingType, submitMutation, submitting, team} = props;
  const {meetingSettings: {meetingsOffered, meetingsRemaining}, teamId, teamName, tier} = team;
  const onStartMeetingClick = () => {
    submitMutation();
    StartNewMeetingMutation(atmosphere, {teamId, meetingType}, {history}, onError, onCompleted);
  };
  const isPro = tier === PRO;
  const canStartMeeting = isPro || meetingsRemaining > 0;
  const meetingLabel = meetingTypeToLabel[meetingType];
  const meetingSlug = meetingTypeToSlug[meetingType];
  return (
    <Lobby>
      <LabelHeading>{`${meetingLabel} Meeting Lobby`}</LabelHeading>
      <MeetingPhaseHeading>{`${teamName} ${meetingLabel}`}</MeetingPhaseHeading>
      <MeetingCopy>
        {'The person who presses “Start Meeting” will be today’s Facilitator.'}<br />
        {'Everyone’s display automatically follows the Facilitator.'}
      </MeetingCopy>
      <ButtonGroup>
        <ButtonBlock>
          <Button
            buttonStyle="primary"
            colorPalette="warm"
            depth={1}
            disabled={!canStartMeeting}
            isBlock
            label={`Start ${meetingLabel} Meeting`}
            onClick={onStartMeetingClick}
            buttonSize="large"
            waiting={submitting}
          />
        </ButtonBlock>
        {!isPro && !meetingsOffered &&
          <ButtonBlock>
            <LoadableModal
              LoadableComponent={UpgradeModalLoadable}
              maxWidth={350}
              maxHeight={225}
              queryVars={{isBillingLeader: false}}
              toggle={<Button
                aria-label="Get Access Now"
                buttonSize="large"
                buttonStyle="solid"
                colorPalette="green"
                depth={1}
                isBlock
                label="Get Access Now"
              />}
            />
          </ButtonBlock>
        }
      </ButtonGroup>
      <UrlBlock>
        <CopyShortLink url={makeHref(`/${meetingSlug}/${teamId}`)} />
      </UrlBlock>
    </Lobby>
  );
};

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
);
