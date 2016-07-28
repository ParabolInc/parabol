import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

import AvatarGroup from 'universal/components/AvatarGroup/AvatarGroup';
import IconLink from 'universal/components/IconLink/IconLink';
import ProgressBar from 'universal/components/ProgressBar/ProgressBar';
import CheckinCards from 'universal/modules/meeting/components/CheckinCards/CheckinCards';
import ShortcutsMenu from 'universal/modules/team/components/ShortcutsMenu/ShortcutsMenu';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingSectionHeading from 'universal/modules/meeting/components/MeetingSectionHeading/MeetingSectionHeading';
import MeetingSectionSubheading from 'universal/modules/meeting/components/MeetingSectionSubheading/MeetingSectionSubheading';
import Sidebar from 'universal/modules/team/components/Sidebar/Sidebar';

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
      checkin: 'tbd',
      connection: 'offline',
      hasBadge: true,
      picture: Taya,
      size: 'small'
    },
    {
      checkin: 'tbd',
      connection: 'offline',
      hasBadge: true,
      picture: Terry,
      size: 'small'
    }
  ]
};

const demoCards = [
  {
    name: '@FirstKitty',
    hasBadge: false,
    image: 'https://placekitten.com/g/600/600',
    state: 'invited', // invited || not attending || fully present,
    isCurrent: false
  },
  {
    name: '@SecondKitty',
    hasBadge: false,
    image: 'https://placekitten.com/g/600/600',
    state: 'invited', // invited || not attending || fully present,
    isCurrent: false
  },
  {
    name: '@ThirdKitty',
    hasBadge: false,
    image: 'https://placekitten.com/g/600/600',
    state: 'invited', // invited || not attending || fully present,
    isCurrent: true
  },
  {
    name: '@FourthKitty',
    hasBadge: false,
    image: 'https://placekitten.com/g/600/600',
    state: 'invited', // invited || not attending || fully present,
    isCurrent: false
  },
  {
    name: '@FifthKitty',
    hasBadge: false,
    image: 'https://placekitten.com/g/600/600',
    state: 'invited', // invited || not attending || fully present,
    isCurrent: false
  }
];

const MeetingCheckinLayout = (props) => {
  const {team} = props;
  // const handleClick = (e) => e.preventDefault();
  return (
    <MeetingLayout>
      {/* */}
      <Sidebar facilitatorPhase="checkin" localPhase="checkin" {...team} />
      {/* */}
      <MeetingMain>
        {/* */}
        <MeetingSection paddingBottom="2rem" paddingTop="2rem">
          <div className={s.avatars}>
            <AvatarGroup avatars={team.members} label="Team:" />
            <div className={s.progress}>
              <ProgressBar />
            </div>
          </div>
        </MeetingSection>
        {/* */}
        {/* */}
        <MeetingSection flexToFill paddingBottom="2rem">
          {/* */}
          <MeetingSection paddingBottom="2rem">
            <MeetingSectionHeading>
              Hola <span className={s.name}>Kitty</span>, why is this prototype layout broken?
            </MeetingSectionHeading>
            <MeetingSectionSubheading>
              A: Because the component is being updated to do real thangs.
            </MeetingSectionSubheading>
          </MeetingSection>
          {/* */}
          <CheckinCards cards={demoCards} />
          <MeetingSection paddingBottom="2rem">
            <IconLink
              icon="arrow-circle-right"
              iconPlacement="right"
              label="Next teammate (press enter)"
              scale="large"
              theme="warm"
            />
          </MeetingSection>
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
  name: {
    color: theme.palette.warm
  },

  avatars: {
    // Define
  },

  progress: {
    paddingLeft: '5.25rem',
    paddingRight: '.75rem',
    paddingTop: '1rem'
  }
});

MeetingCheckinLayout.propTypes = {
  team: PropTypes.object
};

MeetingCheckinLayout.defaultProps = {
  team: exampleTeam
};

export default look(MeetingCheckinLayout);
