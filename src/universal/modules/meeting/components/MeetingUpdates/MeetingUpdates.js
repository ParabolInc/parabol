import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

import Avatar from 'universal/components/Avatar/Avatar';
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
  console.log('in updates');
  return (
    <MeetingMain>
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
            <div className={s.linkSpacer}>{' '}</div>
            <div className={s.avatar}>
              <Avatar {...aTeamMember} hasLabel labelRight size="large" />
            </div>
            <div className={s.linkSpacer}>
              <IconLink icon="arrow-circle-right" iconPlacement="right" label="Next team member" />
            </div>
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
  },

  linkSpacer: {
    textAlign: 'right',
    width: '9.25rem'
  }
});

MeetingUpdatesLayout.propTypes = {
  members: PropTypes.array
};

export default look(MeetingUpdatesLayout);
