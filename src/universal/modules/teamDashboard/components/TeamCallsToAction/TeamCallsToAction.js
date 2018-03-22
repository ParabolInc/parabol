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
import {Menu, MenuItem} from 'universal/modules/menu';
import {Button} from 'universal/components';
import ui from 'universal/styles/ui';

type Props = {
  teamId: TeamID,
  history: RouterHistory
};

const ButtonGroup = styled('div')({
  display: 'flex',
  minWidth: '14rem',
  paddingLeft: ui.dashGutterSmall,

  [ui.dashBreakpoint]: {
    minWidth: '13rem',
    paddingLeft: ui.dashGutterLarge
  }
});

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const TeamCallToAction = ({history, teamId}: Props) => {
  const goToMeetingLobby = () =>
    history.push(`/meeting/${teamId}/`);

  const goToRetroLobby = () =>
    history.push(`/retro/${teamId}/`);

  const itemFactory = () => {
    const listItems = [];
    listItems.push(
      <MenuItem icon="arrow-circle-o-right" label="Start Action Meeting" onClick={goToMeetingLobby} />,
      <MenuItem icon="clock-o" label="Start Retro Meeting" onClick={goToRetroLobby} />
    );
    return listItems;
  };

  const buttonToggle = (
    <Button
      buttonSize="small"
      buttonStyle="primary"
      colorPalette="warm"
      icon="chevron-down"
      iconPlacement="right"
      isBlock
      label="Start Meeting"
    />
  );

  return (
    <ButtonGroup>
      {__RELEASE_FLAGS__.retro ?
        <Menu
          itemFactory={itemFactory}
          originAnchor={originAnchor}
          maxHeight="none"
          menuWidth="13rem"
          targetAnchor={targetAnchor}
          toggle={buttonToggle}
        /> :
        <Button
          buttonSize="small"
          buttonStyle="primary"
          colorPalette="warm"
          icon="users"
          iconPlacement="left"
          isBlock
          label="Start Action Meeting"
          onClick={goToMeetingLobby}
        />
      }
    </ButtonGroup>
  );
};

export default withRouter(TeamCallToAction);
