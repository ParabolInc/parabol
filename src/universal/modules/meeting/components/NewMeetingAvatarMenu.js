// @flow
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {textOverflow} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import MenuWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuWithShortcuts';
import MenuItemWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuItemWithShortcuts';
import styled from 'react-emotion';
import PromoteFacilitatorMutation from 'universal/mutations/PromoteFacilitatorMutation';
import RequestFacilitatorMutation from 'universal/mutations/RequestFacilitatorMutation';
import {connect} from 'react-redux';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {LOBBY} from 'universal/utils/constants';
import {phaseLabelLookup} from 'universal/utils/meetings/lookups';
import {Dispatch} from 'react-redux';
import type {NewMeetingAvatarMenu_newMeeting as NewMeeting} from './__generated__/NewMeetingAvatarMenu_newMeeting.graphql';

const Label = styled('div')({
  ...textOverflow,
  borderBottom: `1px solid ${appTheme.palette.mid30l}`,
  color: ui.palette.dark,
  fontSize: ui.menuItemFontSize,
  fontWeight: 600,
  lineHeight: ui.menuItemHeight,
  marginBottom: ui.menuGutterVertical,
  padding: `0 ${ui.menuGutterHorizontal}`,
  userSelect: 'none'
});

type Props = {
  atmosphere: Object,
  dispatch: Dispatch,
  newMeeting: NewMeeting,
  teamMember: Object,
  closePortal: () => void,
  handleNavigate: ?() => void,
}

const NewMeetingAvatarMenu = (props: Props) => {
  const {atmosphere, dispatch, newMeeting, teamMember, closePortal, handleNavigate} = props;
  const {viewerId} = atmosphere;
  const {localPhase, meetingId, facilitatorUserId} = newMeeting || {};
  const {isCheckedIn, isConnected, isSelf, preferredName} = teamMember;
  const connected = isConnected ? 'connected' : 'disconnected';
  const checkedIn = isCheckedIn ? ' and checked in' : '';
  const headerLabel = `${preferredName} is ${connected} ${checkedIn}`;
  const promoteToFacilitator = () => {
    PromoteFacilitatorMutation(atmosphere, {facilitatorId: teamMember.id}, dispatch);
  };
  const requestFacilitator = () => {
    RequestFacilitatorMutation(atmosphere, meetingId);
  };
  const isViewerFacilitating = viewerId === facilitatorUserId;
  const avatarIsFacilitating = teamMember.userId === facilitatorUserId;
  const handlePromote = isViewerFacilitating && !isSelf && isConnected && promoteToFacilitator || undefined;
  const handleRequest = avatarIsFacilitating && !isSelf && requestFacilitator || undefined;
  const phaseLabel = localPhase ? phaseLabelLookup[localPhase.phaseType] : LOBBY;
  return (
    <MenuWithShortcuts
      ariaLabel={'Select what to do with this team member'}
      closePortal={closePortal}
    >
      <Label>{headerLabel}</Label>
      {handleNavigate &&
      <MenuItemWithShortcuts
        key="handleNavigate"
        label={`See ${preferredName}’s ${phaseLabel}`}
        onClick={handleNavigate}
      />
      }
      {handlePromote &&
      <MenuItemWithShortcuts
        key="promoteToFacilitator"
        label={`Promote ${preferredName} to Facilitator`}
        onClick={handlePromote}
      />
      }
      {handleRequest &&
      <MenuItemWithShortcuts
        key="requestFacilitator"
        label={'Request to become Facilitator'}
        onClick={handleRequest}
      />
      }
    </MenuWithShortcuts>
  );
};

export default createFragmentContainer(
  connect()(withAtmosphere(NewMeetingAvatarMenu)),
  graphql`
    fragment NewMeetingAvatarMenu_newMeeting on NewMeeting {
      meetingId: id
      facilitatorUserId
      localPhase {
        phaseType
      }
    }
    fragment NewMeetingAvatarMenu_teamMember on TeamMember {
      isCheckedIn
      isConnected
      isSelf
      preferredName
      userId
    }
  `
);
