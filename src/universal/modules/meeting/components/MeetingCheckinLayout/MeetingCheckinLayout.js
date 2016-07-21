import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

import AvatarGroup from 'universal/components/AvatarGroup/AvatarGroup';
import IconLink from 'universal/components/IconLink/IconLink';
import ProgressBar from 'universal/components/ProgressBar/ProgressBar';
import CardStage from 'universal/modules/team/components/CardStage/CardStage';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingSectionHeading from 'universal/modules/meeting/components/MeetingSectionHeading/MeetingSectionHeading';

let s = {};

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
  const {members} = props;
  // const handleClick = (e) => e.preventDefault();
  return (
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

export default look(MeetingCheckinLayout);
