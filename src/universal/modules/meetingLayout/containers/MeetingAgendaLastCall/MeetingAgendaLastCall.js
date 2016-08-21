import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {AGENDA} from 'universal/utils/constants';
import exampleTeam from 'universal/modules/patterns/helpers/exampleTeam';

import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';

import AvatarGroup from 'universal/modules/meeting/components/AvatarGroup/AvatarGroup';
import ShortcutsToggle from 'universal/modules/team/components/ShortcutsToggle/ShortcutsToggle';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';
import Sidebar from '../../../meeting/components/Sidebar/Sidebar';

// NOTE: This is a throw-away layout component for prototyping.
//       The real deal is being coded up in /meeting/components

let s = {};

const MeetingAgendaLastCall = (props) => {
  const {team} = props;
  return (
    <MeetingLayout>
      {/* */}
      <Sidebar facilitatorPhase={AGENDA} localPhase={AGENDA} {...team} />
      {/* */}
      <MeetingMain>
        {/* */}
        <MeetingSection paddingBottom="2rem" paddingTop="2rem">
          <AvatarGroup avatars={team.teamMembers} localPhase={AGENDA} />
        </MeetingSection>
        {/* */}
        {/* */}
        <MeetingSection flexToFill paddingBottom="2rem">
          {/* */}
          <MeetingSection paddingBottom="2rem">
            {/* */}
            {/* */}
            {/* */}
            <MeetingPhaseHeading>Boom!</MeetingPhaseHeading>
            <Type align="center" bold family="serif" marginBottom="2.25rem" marginTop="2rem" scale="s5" theme="black">
              We worked on <span className={s.highlight}>7 Agenda Items </span>
              resulting in <span className={s.highlight}>12 Actions </span>
              and <span className={s.highlight}>4 projects</span>.
            </Type>
            <Type align="center" marginBottom="2.75rem" scale="s4" theme="black">
              Anybody have <b><i>additional Agenda Items</i></b>?<br />
              If so, just press “<span className={s.highlight}><b>+</b></span>” or{' '}
              <span className={s.highlight}>add another Agenda Item</span>.<br />
              If not, you can end the meeting to see a summary.
            </Type>
            <Button
              label="End Meeting"
              size="largest"
              style="outlined"
              theme="cool"
            />
            {/* */}
            {/* */}
            {/* */}
          </MeetingSection>
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

MeetingAgendaLastCall.propTypes = {
  team: PropTypes.object
};

MeetingAgendaLastCall.defaultProps = {
  team: exampleTeam
};

s = StyleSheet.create({
  highlight: {
    color: theme.palette.warm
  }
});

export default look(MeetingAgendaLastCall);
