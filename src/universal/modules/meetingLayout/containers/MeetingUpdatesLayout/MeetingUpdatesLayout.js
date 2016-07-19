import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

import AvatarGroup from 'universal/components/AvatarGroup/AvatarGroup';
import Columns from 'universal/components/Columns/Columns';
import IconLink from 'universal/components/IconLink/IconLink';
import ShortcutsMenu from 'universal/modules/team/components/ShortcutsMenu/ShortcutsMenu';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingSectionHeading from 'universal/modules/meeting/components/MeetingSectionHeading/MeetingSectionHeading';
// eslint-disable-next-line max-len
import MeetingSectionSubheading from 'universal/modules/meeting/components/MeetingSectionSubheading/MeetingSectionSubheading';
import Sidebar from 'universal/modules/team/components/Sidebar/Sidebar';

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
      badge: 'check'
    },
    {
      image: Matt,
      size: 'small',
      badge: 'check'
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

console.log(s, theme);

const MeetingCheckinLayout = (props) => {
  const {members} = props;
  return (
    <MeetingLayout>
      {/* */}
      <Sidebar {...props} />
      {/* */}
      <MeetingMain>
        {/* */}
        <MeetingSection paddingBottom="2rem" paddingTop="2rem">
          <div className={s.avatars}>
            <AvatarGroup avatars={members} label="Updates given:" />
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
              Keep ‘em quick—discussion is coming up!
            </MeetingSectionSubheading>
          </MeetingSection>
          {/* */}
          <Columns />
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
  // Define
});

MeetingCheckinLayout.propTypes = {
  members: PropTypes.array
};

MeetingCheckinLayout.defaultProps = {...exampleTeam};

export default look(MeetingCheckinLayout);
