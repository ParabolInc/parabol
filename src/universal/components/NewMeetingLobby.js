// @flow
import * as React from 'react';
import type {RouterHistory} from 'react-router-dom';
import Button from 'universal/components/Button/Button';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';
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
import {meetingTypeToLabel, meetingTypeToSlug} from 'universal/utils/meetings/lookups';
import MeetingCopy from 'universal/modules/meeting/components/MeetingCopy/MeetingCopy';
import makeHref from 'universal/utils/makeHref';
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import {withRouter} from 'react-router-dom';
import UpgradeModalRootLoadable from 'universal/components/UpgradeModalRootLoadable';

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

const SalesPitch = styled('div')({
  color: ui.colorText,
  fontSize: '1.2rem',
  lineHeight: 1.5
});

const InitialHook = styled(SalesPitch)({
  marginTop: '1rem'
});

const TrialStatus = styled(MeetingCopy)({
  textAlign: 'center',
  marginTop: '0.5rem'
});

const NewMeetingLobby = (props: Props) => {
  const {atmosphere, history, onError, onCompleted, meetingType, submitMutation, submitting, team} = props;
  const {orgId, organization, teamId, teamName, tier} = team;
  const {retroMeetingsOffered = 3, retroMeetingsRemaining = 3} = organization;
  // const retroMeetingsOffered = 3;
  // const retroMeetingsRemaining = 0;
  const onStartMeetingClick = () => {
    submitMutation();
    StartNewMeetingMutation(atmosphere, {teamId, meetingType}, {history}, onError, onCompleted);
  };
  const isPro = tier === PRO;
  const canStartMeeting = isPro || retroMeetingsRemaining > 0;
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
      {!isPro &&
      <div>
        <SalesPitch>
          <div>Running a retrospective is the most effective way to learn how your team can work smarter.</div>
          <div>In 30 minutes you can discover underlying tensions, create next steps, and have a summary delivered to your inbox.</div>
        </SalesPitch>
        {retroMeetingsRemaining === retroMeetingsOffered &&
        <SalesPitch>Try a few retrospectives with your team, on the house.</SalesPitch>
        }
        {retroMeetingsRemaining !== retroMeetingsOffered && retroMeetingsRemaining > 0 &&
        <div>
          <InitialHook>Upgrade to Pro to unlock unlimited retrospectives.</InitialHook>
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
              label="Get Access Now"
            />}
          />
        </div>
        }
      </div>
      }

      <ButtonGroup>
        <ButtonBlock>
          {isPro || retroMeetingsRemaining > 0 ?
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
            /> :
            <LoadableModal
              LoadableComponent={UpgradeModalRootLoadable}
              maxWidth={350}
              maxHeight={225}
              queryVars={{orgId}}
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
          }
          {!isPro && retroMeetingsRemaining > 0 &&
          <TrialStatus>{`${retroMeetingsRemaining} of ${retroMeetingsOffered} meetings remaining`}</TrialStatus>
          }
        </ButtonBlock>
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
      teamId: id
      teamName: name,
      orgId
      organization {
        retroMeetingsOffered
        retroMeetingsRemaining
      }
    }
  `
);
