import React, {PropTypes} from 'react';
import {AGENDA} from 'universal/utils/constants';
import exampleTeam from 'universal/modules/patterns/helpers/exampleTeam';

import IconLink from 'universal/components/IconLink/IconLink';
import Type from 'universal/components/Type/Type';

import AvatarGroup from 'universal/modules/meeting/components/AvatarGroup/AvatarGroup';
import ShortcutsToggle from 'universal/modules/team/components/ShortcutsToggle/ShortcutsToggle';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';
import Sidebar from 'universal/modules/team/components/Sidebar/Sidebar';

// NOTE: This is a throw-away layout component for prototyping.
//       The real deal is being coded up in /meeting/components

const MeetingAgendaFirstCall = (props) => {
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
            <MeetingPhaseHeading>Whatcha need?</MeetingPhaseHeading>
            <Type align="center" bold marginTop="2rem" scale="s5" theme="black">
              Add your Agenda Items to the queue now…
            </Type>
            <IconLink
              icon="arrow-circle-right"
              iconPlacement="right"
              label="…great! Let’s take care of our Agenda Items"
              scale="large"
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

MeetingAgendaFirstCall.propTypes = {
  team: PropTypes.object
};

MeetingAgendaFirstCall.defaultProps = {
  team: exampleTeam
};

export default MeetingAgendaFirstCall;
