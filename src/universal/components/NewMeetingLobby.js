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
import GetRetroAccessLoadable from 'universal/components/GetRetroAccessLoadable';
import type {NewMeetingLobby_team as Team} from './__generated__/NewMeetingLobby_team.graphql';

const TitleHeader = styled('h2')({
  textTransform: 'uppercase'
});

const TeamNameHeader = styled('h1')({
  fontWeight: 800
});

const RetroExpository = styled('div')({
  fontWeight: 300
});

const GetAccessCopy = styled('div')({
  fontWeight: 300
});

type Props = {
  atmosphere: Object,
  history: RouterHistory,
  team: Team,
  ...MutationProps
};

const NewMeetingLobby = (props: Props) => {
  const {submitMutation, submitting, team} = props;
  const {meetingSettings: {meetingsOffered, meetingsRemaining}, teamName, tier} = team;
  const onStartMeetingClick = () => {
    submitMutation();
    // StartNewMeetingMutation(atmosphere, teamId, history, onError, onCompleted);
  };
  const isPro = tier === PRO;
  return (
    <React.Fragment>
      <TitleHeader>{'Retro Meeting Lobby'}</TitleHeader>
      <TeamNameHeader>{`${teamName} Retro`}</TeamNameHeader>
      {!isPro &&
      <RetroExpository>
        {'A retrospective lets your team reflect on past work and discover opportunities for how to work better in the future'}
      </RetroExpository>
      }
      {!isPro && !meetingsOffered &&
      <GetAccessCopy>
        <span>{'As a free user, you can start running retrospectives immediately with your team'}</span>
        <LoadableModal
          LoadableComponent={GetRetroAccessLoadable}
          maxWidth={350}
          maxHeight={225}
          toggle={<Button
            aria-label="Get Access Now"
            buttonSize="large"
            buttonStyle="solid"
            colorPalette="cool"
            depth={1}
            isBlock
            label="GET ACCESS NOW"
            textTransform="uppercase"
          />}
        />
      </GetAccessCopy>
      }

      <Button
        buttonStyle="solid"
        colorPalette="cool"
        depth={1}
        disabled={!meetingsRemaining}
        isBlock
        label="Start Retro Meeting"
        onClick={onStartMeetingClick}
        buttonSize="large"
        textTransform="uppercase"
        waiting={submitting}
      />
    </React.Fragment>
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
