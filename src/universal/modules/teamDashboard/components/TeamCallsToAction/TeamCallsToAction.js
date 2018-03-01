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
import ui from 'universal/styles/ui';

type Props = {
  teamId: TeamID,
  history: RouterHistory
};

const ButtonGroup = styled('div')({
  display: 'flex',
  minWidth: '14rem',
  paddingLeft: '1rem'
});

const ButtonBlock = styled('div')({
  margin: '0 .5em',
  width: '100%'
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
          isBlock
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
