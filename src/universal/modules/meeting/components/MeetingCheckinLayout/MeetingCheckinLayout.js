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

const combineMembersAndCheckins = (members, checkins) =>
  members.map((member) => {
    const checkin = checkins.find((c) => c.id === member.id);
    if (!checkin) {
      console.warn(`combineMembersAndCheckins: checkin not found for member ${member.id}`);
    }
    return {
      ...member,
      ...checkin
    };
  });

const MeetingCheckinLayout = (props) => {
  const {checkins, members, onCheckinNextTeammateClick} = props;
  const cards = combineMembersAndCheckins(members, checkins);
  console.log(cards);
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
        <CardStage cards={cards} />
        <MeetingSection paddingBottom="2rem">
          <IconLink
            icon="arrow-circle-right"
            iconPlacement="right"
            label="Next teammate (press enter)"
            scale="large"
            theme="warm"
            onClick={onCheckinNextTeammateClick}
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
  checkins: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      state: PropTypes.oneOf([
        'invited',
        'not attending',
        'fully present'
      ]).isRequired,
      isCurrent: PropTypes.bool.isRequired
    }).isRequired
  ).isRequired,
  members: PropTypes.array,
  onCheckinNextTeammateClick: PropTypes.func.isRequired
};

export default look(MeetingCheckinLayout);
