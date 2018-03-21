// @flow
import React from 'react';
import {connect} from 'react-redux';
import Avatar from 'universal/components/Avatar/Avatar';
import Tag from 'universal/components/Tag/Tag';
import appTheme from 'universal/styles/theme/appTheme';
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg';
import ui from 'universal/styles/ui';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {createFragmentContainer} from 'react-relay';
import LoadableMenu from 'universal/components/LoadableMenu';
import styled from 'react-emotion';
import LoadableNewMeetingAvatarMenu from 'universal/modules/meeting/components/LoadableNewMeetingAvatarMenu';
import {CHECKIN, UPDATES} from 'universal/utils/constants';

import type {NewMeetingAvatar_teamMember as TeamMember} from './__generated__/NewMeetingAvatar_teamMember.graphql';
import type {NewMeetingAvatar_newMeeting as NewMeeting} from './__generated__/NewMeetingAvatar_newMeeting.graphql';

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

const borderActive = appTheme.brand.secondary.yellow;
const borderLocal = appTheme.palette.mid30l;
const boxShadowBase = '0 0 0 2px #fff, 0 0 0 4px';
const boxShadowWarm = `${boxShadowBase} ${borderActive}`;
const boxShadowLocal = `${boxShadowBase} ${borderLocal}`;

const Item = styled('div')({
  marginLeft: '1rem',
  marginRight: '.25rem',
  position: 'relative'
});

const AvatarBlock = styled('div')(
  {
    borderRadius: '100%',
    width: '2.25rem',

    [ui.breakpoint.wide]: {
      width: '2.5rem'
    },
    [ui.breakpoint.wider]: {
      width: '3rem'
    },
    [ui.breakpoint.widest]: {
      width: '4rem'
    },

    ':hover': {
      opacity: '.5'
    }
  },
  ({isLocalStage, isFacilitatorStage, isReadOnly}) => {
    let boxShadow;
    if (isFacilitatorStage) {
      boxShadow = boxShadowWarm;
    } else if (isLocalStage) {
      boxShadow = boxShadowLocal;
    } else if (isReadOnly) {
      boxShadow = 'none';
    }
    return {
      boxShadow,
      ':hover': isReadOnly ? 1 : undefined
    };
  }
);

const TagBlock = styled('div')({
  bottom: '-1.75rem',
  left: '50%',
  paddingRight: ui.tagGutter,
  position: 'absolute',
  transform: 'translateX(-50%)'
});

type Props = {
  gotoStage: () => void,
  isFacilitatorStage: boolean,
  newMeeting: NewMeeting,
  teamMember: TeamMember,
}
const NewMeetingAvatar = (props: Props) => {
  const {gotoStage, isFacilitatorStage, newMeeting, teamMember} = props;
  const {facilitatorUserId, localPhase, localStage} = newMeeting || {};
  const localPhaseType = localPhase && localPhase.phaseType;
  const canNavigate = localPhaseType === CHECKIN || localPhaseType === UPDATES;
  const {teamMemberId, isConnected, isSelf, meetingMember: {isCheckedIn}, picture = defaultUserAvatar, userId} = teamMember;
  const avatarIsFacilitating = userId === facilitatorUserId;
  const handleNavigate = canNavigate ? gotoStage : undefined;
  return (
    <Item>
      <AvatarBlock
        isReadOnly={!canNavigate}
        isLocalStage={localStage && localStage.teamMemberId === teamMemberId}
        isFacilitatorStage={isFacilitatorStage}
      >
        <LoadableMenu
          LoadableComponent={LoadableNewMeetingAvatarMenu}
          maxWidth={350}
          maxHeight={225}
          originAnchor={originAnchor}
          queryVars={{
            handleNavigate,
            newMeeting,
            teamMember
          }}
          targetAnchor={targetAnchor}
          toggle={<Avatar
            hasBadge
            isClickable
            picture={picture}
            isConnected={isConnected || isSelf}
            isCheckedIn={isCheckedIn}
            size="fill"
          />}
        />
      </AvatarBlock>
      {avatarIsFacilitating &&
      <TagBlock>
        <Tag colorPalette="gray" label="Facilitator" />
      </TagBlock>
      }
    </Item>
  );
};

export default createFragmentContainer(
  connect()(withAtmosphere(NewMeetingAvatar)),
  graphql`
    fragment NewMeetingAvatar_teamMember on TeamMember {
      teamMemberId: id
      meetingMember(meetingId: $meetingId) {
        isCheckedIn 
      }
      isConnected
      isSelf
      picture
      userId
      ...NewMeetingAvatarMenu_teamMember
    }
    fragment NewMeetingAvatar_newMeeting on NewMeeting {
      facilitatorUserId
      localStage {
        ... on NewMeetingTeamMemberStage {
          teamMemberId
        }
      }
      localPhase {
        phaseType
      }
      ...NewMeetingAvatarMenu_newMeeting
    }
  `
);
