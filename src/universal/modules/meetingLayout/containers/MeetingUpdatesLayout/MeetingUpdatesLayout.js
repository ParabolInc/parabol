import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {CHECKIN, UPDATES} from 'universal/utils/constants';

import Avatar from 'universal/components/Avatar/Avatar';
import AvatarGroup from '../../../meeting/components/AvatarGroup/AvatarGroup';
// import Columns from 'universal/components/Columns/Columns';
import IconLink from 'universal/components/IconLink/IconLink';
import ShortcutsMenu from 'universal/modules/team/components/ShortcutsMenu/ShortcutsMenu';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingSectionHeading from 'universal/modules/meeting/components/MeetingSectionHeading/MeetingSectionHeading';
// eslint-disable-next-line max-len
import MeetingSectionSubheading from 'universal/modules/meeting/components/MeetingSectionSubheading/MeetingSectionSubheading';
import Sidebar from '../../../meeting/components/Sidebar/Sidebar';

import Jordan from 'universal/styles/theme/images/avatars/jordan-husney-avatar.jpg';
import Matt from 'universal/styles/theme/images/avatars/matt-krick-avatar.jpg';
import Taya from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';
import Terry from 'universal/styles/theme/images/avatars/terry-acker-avatar.jpg';

// NOTE: This is a throw-away layout component for prototyping.
//       The real deal is being coded up in /meeting/components

let s = {};

const exampleTeam = {
  shortUrl: 'https://prbl.io/a/b7s8x9',
  teamName: 'Core',
  timerValue: '30:00',
  members: [
    {
      checkin: 'present',
      connection: 'online',
      hasBadge: true,
      picture: Jordan,
      size: 'small'
    },
    {
      checkin: 'present',
      connection: 'online',
      hasBadge: true,
      picture: Matt,
      size: 'small'
    },
    {
      checkin: 'present',
      connection: 'offline',
      hasBadge: true,
      picture: Taya,
      size: 'small'
    },
    {
      checkin: 'absent',
      connection: 'offline',
      hasBadge: true,
      picture: Terry,
      size: 'small'
    }
  ]
};

const MeetingUpdatesLayout = (props) => {
  const {team} = props;
  return (
    <MeetingLayout>
      {/* */}
      <Sidebar facilitatorPhase={CHECKIN} localPhase={UPDATES} {...team} />
      {/* */}
      <MeetingMain>
        {/* */}
        <MeetingSection paddingBottom="2rem" paddingTop="2rem">
          <div className={s.avatars}>
            <AvatarGroup avatars={team.members} localPhase={UPDATES} />
          </div>
        </MeetingSection>
        {/* */}
        {/* */}
        <MeetingSection flexToFill paddingBottom="2rem">
          {/* */}
          <MeetingSection paddingBottom="2rem">
            <MeetingSectionHeading>
              What’s changed since last week?
            </MeetingSectionHeading>
            <MeetingSectionSubheading>
              Keep ‘em quick—discussion time is next!
            </MeetingSectionSubheading>
          </MeetingSection>
          {/* */}
          <div className={s.layout}>
            <div className={s.nav}>
              <div className={s.linkSpacer}>{' '}</div>
              <div className={s.avatar}>
                <Avatar hasLabel image={Taya} name="Taya Mueller" labelRight size="large" />
              </div>
              <div className={s.linkSpacer}>
                <IconLink icon="arrow-circle-right" iconPlacement="right" label="Next team member" />
              </div>
            </div>
            Outcome Columns
          </div>
          {/* */}
          {/* */}
        </MeetingSection>
        {/* */}
      </MeetingMain>
      {/* */}
      <ShortcutsMenu />
      {/* */}
    </MeetingLayout>
  );
};

s = StyleSheet.create({
  layout: {
    margin: '0 auto',
    maxWidth: '80rem',
    padding: '0 2rem',
    width: '100%'
  },

  nav: {
    display: 'flex !important',
    width: '100%'
  },

  avatar: {
    flex: 1,
    textAlign: 'center'
  },

  linkSpacer: {
    textAlign: 'right',
    width: '9.25rem'
  }
});

MeetingUpdatesLayout.propTypes = {
  team: PropTypes.object
};

MeetingUpdatesLayout.defaultProps = {
  team: exampleTeam
};

export default look(MeetingUpdatesLayout);
