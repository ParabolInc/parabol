/**
 * Displays the calls to action at the top of the team dashboard.
 *
 * @flow
 */
import type {RouterHistory} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import type {TeamID} from 'universal/types/team';
import React from 'react';
import styled from 'react-emotion';
import {Button} from 'universal/components';
import ui from 'universal/styles/ui';
import LoadableTeamCallsToActionMenu from 'universal/modules/teamDashboard/components/TeamCallsToAction/LoadableTeamCallsToActionMenu';
import LoadableMenu from 'universal/components/LoadableMenu';
import {meetingTypeToSlug} from 'universal/utils/meetings/lookups';
import {ACTION} from 'universal/utils/constants';

type Props = {
  isRetroEnabled: boolean,
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

const TeamCallToAction = (props: Props) => {
  const {history, isRetroEnabled, teamId} = props;
  const goToMeetingLobby = () => {
    const slug = meetingTypeToSlug[ACTION];
    history.push(`/${slug}/${teamId}/`);
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
      {!isRetroEnabled ?
        <LoadableMenu
          LoadableComponent={LoadableTeamCallsToActionMenu}
          maxWidth={208}
          maxHeight={225}
          originAnchor={originAnchor}
          queryVars={{teamId}}
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
