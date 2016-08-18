import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {srOnly} from 'universal/styles/helpers';

import Avatar from 'universal/components/Avatar/Avatar';
import AvatarGroup from '../../../meeting/components/AvatarGroup/AvatarGroup';
import CreateCard from 'universal/components/CreateCard/CreateCard';
import IconLink from 'universal/components/IconLink/IconLink';
import ShortcutsToggle from 'universal/modules/team/components/ShortcutsToggle/ShortcutsToggle';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingSectionHeading from 'universal/modules/meeting/components/MeetingSectionHeading/MeetingSectionHeading';
// eslint-disable-next-line max-len
import MeetingSectionSubheading from 'universal/modules/meeting/components/MeetingSectionSubheading/MeetingSectionSubheading';
import Sidebar from 'universal/modules/team/components/Sidebar/Sidebar';

import Jordan from 'universal/styles/theme/images/avatars/jordan-husney-avatar.jpg';
import Matt from 'universal/styles/theme/images/avatars/matt-krick-bw.png';
import Miramar from 'universal/styles/theme/images/avatars/miramar-suarez-penalva.jpg';
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
      picture: Miramar,
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

const MeetingRequestsLayout = (props) => {
  const {team} = props;
  return (
    <MeetingLayout>
      {/* */}
      <Sidebar facilitatorPhase="requests" localPhase="requests" {...team} />
      {/* */}
      <MeetingMain>
        {/* */}
        <MeetingSection paddingBottom="2rem" paddingTop="2rem">
          <div className={s.avatars}>
            <AvatarGroup avatars={team.members} />
          </div>
        </MeetingSection>
        {/* */}
        {/* */}
        <MeetingSection flexToFill paddingBottom="2rem">
          {/* */}
          <MeetingSection paddingBottom="2rem">
            <MeetingSectionHeading>
              Whatcha need?
            </MeetingSectionHeading>
            <MeetingSectionSubheading>
              TODO: Make MeetingSection HelpText toggle
            </MeetingSectionSubheading>
          </MeetingSection>
          {/* */}
          <div className={s.layout}>
            <div className={s.nav}>
              <div className={s.linkSpacer}>{' '}</div>
              <div className={s.avatar}>
                <Avatar picture={Taya} hasBadge={false} size="large" />
                <div className={s.requestLabel}>
                  “{'S.P.A.'}”
                </div>
              </div>
              <div className={s.linkSpacer}>
                <IconLink icon="arrow-circle-right" iconPlacement="right" label="Next Request" />
              </div>
            </div>

            <div className={s.cardRow}>
              <div className={s.cardRowItem}>
                <CreateCard hasControls />
              </div>
              <div className={s.cardRowItem}>
                <CreateCard />
              </div>
              <div className={s.cardRowItem}>
                <CreateCard />
              </div>
              <div className={s.cardRowItem}>
                <CreateCard />
              </div>
            </div>

          </div>
          {/* */}
          {/* */}
        </MeetingSection>
        {/* */}
      </MeetingMain>
      {/* */}
      <ShortcutsToggle />
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
    paddingBottom: '1rem',
    width: '100%'
  },

  avatar: {
    flex: 1,
    textAlign: 'center'
  },

  linkSpacer: {
    textAlign: 'right',
    paddingTop: '2px',
    width: '9.25rem'
  },

  requestLabel: {
    color: theme.palette.dark,
    display: 'inline-block',
    fontFamily: theme.typography.serif,
    fontSize: theme.typography.s5,
    fontStyle: 'italic',
    fontWeight: 700,
    marginLeft: '1.5rem',
    verticalAlign: 'middle'
  },

  cardRow: {
    display: 'flex !important'
  },

  cardRowItem: {
    marginTop: '2rem',
    padding: '0 1rem',
    width: '25%'
  },

  srOnly: {
    ...srOnly
  }
});

MeetingRequestsLayout.propTypes = {
  team: PropTypes.object
};

MeetingRequestsLayout.defaultProps = {
  team: exampleTeam
};

export default look(MeetingRequestsLayout);
