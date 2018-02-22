/**
 * Displays the calls to action at the top of the team dashboard.
 *
 * @flow
 */
import type {RouterHistory} from 'react-router-dom';
import type {TeamID} from 'universal/types/team';

import React, {Fragment} from 'react';
import styled from 'react-emotion';
import {withRouter} from 'react-router-dom';

import Button from 'universal/components/Button/Button';

type Props = {
  teamId: TeamID,
  history: RouterHistory
};

const Buffer = styled('div')({
  width: '1rem'
});

const Container = styled('div')({
  display: 'flex'
});

const TeamCallToAction = ({history, teamId}: Props) => {
  const goToMeetingLobby = () =>
    history.push(`/meeting/${teamId}/`);

  const goToRetroLobby = () =>
    history.push(`/retro/${teamId}/`);

  return (
    <Container>
      <Button
        buttonStyle="solid"
        colorPalette="warm"
        depth={1}
        icon="users"
        iconPlacement="left"
        label="Start Meeting"
        onClick={goToMeetingLobby}
        buttonSize="small"
      />
      {__RELEASE_FLAGS__.newSignIn &&
        <Fragment>
          <Buffer />
          <Button
            buttonStyle="solid"
            colorPalette="warm"
            depth={1}
            icon="users"
            iconPlacement="left"
            label="Start Retrospective"
            onClick={goToRetroLobby}
            buttonSize="small"
          />
        </Fragment>
      }
    </Container>
  );
};

export default withRouter(TeamCallToAction);
