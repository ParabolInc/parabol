import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

import Avatar from 'universal/components/Avatar/Avatar';
import AvatarGroup from 'universal/components/AvatarGroup/AvatarGroup';
import Columns from 'universal/components/Columns/Columns';
import IconLink from 'universal/components/IconLink/IconLink';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingSectionHeading from 'universal/modules/meeting/components/MeetingSectionHeading/MeetingSectionHeading';
// eslint-disable-next-line max-len
import MeetingSectionSubheading from 'universal/modules/meeting/components/MeetingSectionSubheading/MeetingSectionSubheading';

// TODO: Reorganize under new folder: /meeting/components/MeetingLayouts (TA)

let s = {};

const MeetingUpdatesLayout = (props) => {
  const {members} = props;
  const team = members.filter((m) => m.connection === 'online');
  const aTeamMember = team[0]; // Just for testing

  return (
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
        <div className={s.layout}>
          <div className={s.nav}>
            <IconLink icon="arrow-circle-left" label="Previous team member" />
            <div className={s.avatar}>
              <Avatar {...aTeamMember} hasLabel labelRight size="medium" />
            </div>
            <IconLink icon="arrow-circle-right" iconPlacement="right" label="Next team member" />
          </div>
          <Columns />
        </div>
        {/* */}
        {/* */}
      </MeetingSection>
      {/* */}
    </MeetingMain>
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
  }
});

MeetingUpdatesLayout.propTypes = {
  members: PropTypes.array
};

export default look(MeetingUpdatesLayout);
