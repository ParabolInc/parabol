/**
 * Displays the calls to action at the top of the team dashboard.
 *
 * @flow
 */
import type {RouterHistory} from 'react-router-dom';
import type {TeamID} from 'universal/types/team';

import React from 'react';
import styled from 'react-emotion';
import {withRouter} from 'react-router-dom';

import Button from 'universal/components/Button/Button';

type Props = {
  teamId: TeamID,
  history: RouterHistory
};

const ButtonGroup = styled('div')({
  display: 'flex'
});

const ButtonBlock = styled('div')({
  margin: '0 0.5em'
});

const TeamCallToAction = ({history, teamId}: Props) => {
  const goToMeetingLobby = () =>
    history.push(`/meeting/${teamId}/`);

  const goToRetroLobby = () =>
    history.push(`/retro/${teamId}/`);

  return (
    <ButtonGroup>
      <ButtonBlock>
        <Button
          buttonStyle="solid"
          colorPalette="warm"
          icon="users"
          iconPlacement="left"
          label="Start Action Meeting"
          onClick={goToMeetingLobby}
          buttonSize="small"
        />
      </ButtonBlock>
      {__RELEASE_FLAGS__.retro &&
        <ButtonBlock>
          <Button
            buttonStyle="solid"
            colorPalette="warm"
            icon="users"
            iconPlacement="left"
            label="Start Retrospective"
            onClick={goToRetroLobby}
            buttonSize="small"
          />
        </ButtonBlock>
      }
    </ButtonGroup>
  );
};

export default withRouter(TeamCallToAction);
