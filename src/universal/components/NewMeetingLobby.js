import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import Button from 'universal/components/Button/Button';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import StartMeetingMutation from 'universal/mutations/StartMeetingMutation';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import {PRO} from 'universal/utils/constants';
import styled from 'react-emotion';

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

const NewMeetingLobby = (props) => {
  const {atmosphere, history, onError, onCompleted, submitMutation, submitting, team} = props;
  const {meetingSettings: {meetingsOffered, meetingsRemaining}, teamId, teamName, tier} = team;
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
        <Button
          aria-label="Get Access Now"
          buttonSize="large"
          buttonStyle="solid"
          colorPalette="cool"
          depth={1}
          isBlock
          label="GET ACCESS NOW"
          textTransform="uppercase"
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
