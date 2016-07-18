import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

import AvatarGroup from 'universal/components/AvatarGroup/AvatarGroup';
import IconLink from 'universal/components/IconLink/IconLink';
import ProgressBar from 'universal/components/ProgressBar/ProgressBar';
import CardStage from 'universal/modules/meeting/components/CardStage/CardStage';
import ShortcutsMenu from 'universal/modules/meeting/components/ShortcutsMenu/ShortcutsMenu';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingSectionHeading from 'universal/modules/meeting/components/MeetingSectionHeading/MeetingSectionHeading';
import Sidebar from 'universal/modules/meeting/components/Sidebar/Sidebar';

import Jordan from 'universal/styles/theme/images/avatars/jordan-husney-avatar.jpg';
import Matt from 'universal/styles/theme/images/avatars/matt-krick-avatar.jpg';
import Taya from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';
import Terry from 'universal/styles/theme/images/avatars/terry-acker-avatar.jpg';

let s = {};

const exampleTeam = {
  shortUrl: 'https://prbl.io/a/b7s8x9',
  teamName: 'Core',
  timerValue: '30:00',
  members: [
    {
      image: Jordan,
      size: 'small',
      badge: 'present'
    },
    {
      image: Matt,
      size: 'small',
      badge: 'present'
    },
    {
      image: Taya,
      size: 'small',
      badge: 'active'
    },
    {
      image: Terry,
      size: 'small'
    }
  ]
};

const demoCards = [
  {
    name: '@FirstKitty',
    image: 'https://placekitten.com/g/600/600',
    badge: null, // absent || active || present
    state: 'invited', // invited || not attending || fully present,
    isCurrent: false
  },
  {
    name: '@SecondKitty',
    image: 'https://placekitten.com/g/600/600',
    badge: null, // absent || active || present
    state: 'invited', // invited || not attending || fully present,
    isCurrent: false
  },
  {
    name: '@ThirdKitty',
    image: 'https://placekitten.com/g/600/600',
    badge: null, // absent || active || present
    state: 'invited', // invited || not attending || fully present,
    isCurrent: true
  },
  {
    name: '@FourthKitty',
    image: 'https://placekitten.com/g/600/600',
    badge: null, // absent || active || present
    state: 'invited', // invited || not attending || fully present,
    isCurrent: false
  },
  {
    name: '@FifthKitty',
    image: 'https://placekitten.com/g/600/600',
    badge: null, // absent || active || present
    state: 'invited', // invited || not attending || fully present,
    isCurrent: false
  }
];

const MeetingCheckinLayout = (props) => {
  const {members} = props;
  // const handleClick = (e) => e.preventDefault();
  return (
    <MeetingLayout>
      {/* */}
      <Sidebar {...props} />
      {/* */}
      <MeetingMain>
        {/* */}
        <MeetingSection paddingBottom="2rem" paddingTop="2rem">
          <div className={s.avatars}>
            <AvatarGroup avatars={members} label="Team:" />
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
              Hola <span className={s.name}>Kitty</span>, ¿por qué no puedes estar completamente enfocado hoy?
            </MeetingSectionHeading>
          </MeetingSection>
          {/* */}
          <CardStage cards={demoCards} />
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
  members: PropTypes.array
};

MeetingCheckinLayout.defaultProps = {...exampleTeam};

export default look(MeetingCheckinLayout);
