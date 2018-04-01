import React from 'react';
import {createFragmentContainer} from 'react-relay';
import MenuWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuWithShortcuts';
import MenuItemWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuItemWithShortcuts';
import {filterTeamMember} from 'universal/modules/teamDashboard/ducks/teamDashDuck';
import type {TeamDashTeamMemberMenu_team as Team} from './__generated__/TeamDashTeamMemberMenu_team.graphql';

import type {Dispatch} from 'react-redux';
import {connect} from 'react-redux';
import {textOverflow} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import styled from 'react-emotion';

type Props = {
  closePortal: () => void,
  dispatch: Dispatch<*>,
  team: Team,
  teamMemberFilterId: ?string,
}

const Label = styled('div')({
  ...textOverflow,
  borderBottom: `1px solid ${appTheme.palette.mid30l}`,
  color: ui.palette.dark,
  fontSize: ui.menuItemFontSize,
  fontWeight: 600,
  lineHeight: ui.menuItemHeight,
  marginBottom: ui.menuGutterVertical,
  padding: `0 ${ui.menuGutterHorizontal}`
});

const TeamDashTeamMemberMenu = (props: Props) => {
  const {closePortal, dispatch, team, teamMemberFilterId} = props;
  const {teamMembers} = team;
  const defaultActiveIdx = teamMembers.findIndex((teamMember) => teamMember.id === teamMemberFilterId) + 2;
  return (
    <MenuWithShortcuts
      ariaLabel={'Select the team member to filter by'}
      closePortal={closePortal}
      defaultActiveIdx={defaultActiveIdx}
    >
      <Label notMenuItem>{'Filter by:'}</Label>
      <MenuItemWithShortcuts
        key={'teamMemberFilterNULL'}
        label={'All members'}
        onClick={() => dispatch(filterTeamMember(null))}
      />
      {
        teamMembers.map((teamMember) => (
          <MenuItemWithShortcuts
            key={`teamMemberFilter${teamMember.id}`}
            label={teamMember.preferredName}
            onClick={() => dispatch(filterTeamMember(teamMember.id, teamMember.preferredName))}
          />
        ))
      }
    </MenuWithShortcuts>
  );
};

export default createFragmentContainer(
  connect()(TeamDashTeamMemberMenu),
  graphql`
    fragment TeamDashTeamMemberMenu_team on Team {
      teamMembers(sortBy: "preferredName") {
        id
        preferredName
      }
    }
  `
);
